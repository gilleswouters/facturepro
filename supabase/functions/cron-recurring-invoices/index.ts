import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const today = new Date().toISOString().split('T')[0]

        // Find invoices whose next_generation_date is today or earlier
        const { data: recurringInvoices, error } = await supabase
            .from('invoices')
            .select('*')
            .not('recurring_interval', 'eq', 'none')
            .not('recurring_interval', 'is', null)
            .lte('next_generation_date', today)

        if (error) throw error

        const results = []

        for (const inv of recurringInvoices) {
            // 1. Calculate new dates
            let nextGenDate = new Date(inv.next_generation_date)
            const oldIssueDate = new Date(inv.invoice_data?.details?.issueDate || inv.created_at)
            const oldDueDate = new Date(inv.invoice_data?.details?.dueDate || inv.created_at)

            let dueDays = Math.round((oldDueDate - oldIssueDate) / (1000 * 60 * 60 * 24))
            if (isNaN(dueDays) || dueDays < 0) dueDays = 30 // Default 30 days

            const newIssueDate = new Date(nextGenDate)
            const newDueDate = new Date(nextGenDate)
            newDueDate.setDate(newDueDate.getDate() + dueDays)

            // Calculate the NEXT next_generation_date
            if (inv.recurring_interval === 'monthly') {
                nextGenDate.setMonth(nextGenDate.getMonth() + 1)
            } else if (inv.recurring_interval === 'quarterly') {
                nextGenDate.setMonth(nextGenDate.getMonth() + 3)
            } else if (inv.recurring_interval === 'yearly') {
                nextGenDate.setFullYear(nextGenDate.getFullYear() + 1)
            } else {
                // Failsafe
                continue
            }

            // 2. Clone the invoice_data and update dates & maybe invoice number
            // We can't perfectly guarantee the next invoice number without the profile format,
            // but we can try to increment a numerical suffix if it exists, or append a copy string.
            const originalNumber = inv.invoice_number
            const numberMatch = originalNumber.match(/(\d+)$/)
            let newInvoiceNumber = `${originalNumber}-COPY`
            if (numberMatch) {
                const numStr = numberMatch[1]
                const parsedNum = parseInt(numStr, 10) + 1 // Very naive increment, might collide.
                newInvoiceNumber = originalNumber.substring(0, numberMatch.index) + String(parsedNum).padStart(numStr.length, '0')
            }

            let newInvoiceData = { ...inv.invoice_data }
            if (newInvoiceData.details) {
                newInvoiceData.details.issueDate = newIssueDate.toISOString().split('T')[0]
                newInvoiceData.details.dueDate = newDueDate.toISOString().split('T')[0]
                newInvoiceData.details.invoiceNumber = newInvoiceNumber
            }

            // 3. Insert the new invoice
            const { error: insertError } = await supabase
                .from('invoices')
                .insert({
                    profile_id: inv.profile_id,
                    invoice_number: newInvoiceNumber,
                    client_name: inv.client_name,
                    total_amount: inv.total_amount,
                    issue_date: newIssueDate.toISOString().split('T')[0],
                    data_snapshot: newInvoiceData,
                    status: 'pending',
                    reminders_enabled: inv.reminders_enabled,
                    recurring_interval: inv.recurring_interval,
                    next_generation_date: nextGenDate.toISOString().split('T')[0]
                })

            if (insertError) {
                console.error('Failed to create recurring invoice for', inv.id, insertError)
                results.push({ id: inv.id, success: false, error: insertError })
                continue
            }

            // 4. Update the OLD invoice so it stops recurring (hand off to the new one)
            // OR we just update the old invoice's next_gen_date and keep it as the "master" record?
            // Usually, recurring creates a new INDEPENDENT invoice. But if the OLD invoice keeps the schedule,
            // we'd update its next_generation_date. If we create a new one with the schedule, we should clear the old one.
            // Let's clear the old one's schedule, transferring ownership of the recurrence to the child.
            await supabase
                .from('invoices')
                .update({
                    recurring_interval: 'none',
                    next_generation_date: null
                })
                .eq('id', inv.id)

            results.push({ id: inv.id, success: true, newNumber: newInvoiceNumber })
        }

        return new Response(
            JSON.stringify({ processed: recurringInvoices.length, results }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (err) {
        console.error(err)
        return new Response(String(err?.message ?? err), { status: 500 })
    }
})
