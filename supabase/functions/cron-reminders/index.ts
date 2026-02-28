import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
    try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Find overdue invoices where reminders are enabled and we haven't sent one recently
        // E.g. reminder_count < 3 and due_date < today and status = 'pending'
        const today = new Date().toISOString().split('T')[0]

        // We only send a reminder if it's been at least 5 days since the last one
        const fiveDaysAgoDate = new Date()
        fiveDaysAgoDate.setDate(fiveDaysAgoDate.getDate() - 5)
        const fiveDaysAgo = fiveDaysAgoDate.toISOString()

        const { data: invoices, error } = await supabase
            .from('invoices')
            .select('*, profiles(company_name, email)')
            .eq('status', 'pending')
            .eq('reminders_enabled', true)
            .lt('reminder_count', 3)
            .or(`last_reminder_sent_at.is.null,last_reminder_sent_at.lt.${fiveDaysAgo}`)

        if (error) throw error

        // Filter by due date manually since it's inside JSON
        const overdues = invoices.filter(inv => {
            const dueDate = inv.data_snapshot?.details?.dueDate
            return dueDate && dueDate < today
        })

        const results = []

        for (const inv of overdues) {
            const clientEmail = inv.data_snapshot?.client?.email
            if (!clientEmail) continue

            const sellerName = inv.profiles?.company_name || 'FacturePro'
            const sellerEmail = inv.profiles?.email || 'noreply@factuurpro.be'
            const clientName = inv.data_snapshot?.client?.companyName || 'Client'
            const invoiceNum = inv.invoice_number

            // Send Email via Resend
            const emailRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: `${sellerName} <factures@factuurpro.be>`,
                    to: [clientEmail],
                    reply_to: sellerEmail,
                    subject: `Rappel de paiement - Facture N° ${invoiceNum}`,
                    html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Bonjour ${clientName},</h2>
                    <p>Sauf erreur ou omission de notre part, le paiement de la facture <strong>N° ${invoiceNum}</strong> émise par ${sellerName} semble être en retard.</p>
                    <p>Nous vous serions reconnaissants de bien vouloir procéder au règlement dans les plus brefs délais.</p>
                    <p>Si votre paiement a déjà été effectué entre-temps, veuillez ne pas tenir compte de ce message.</p>
                    <br/>
                    <p>Cordialement,</p>
                    <p><strong>${sellerName}</strong></p>
                    </div>
                `
                })
            })

            if (!emailRes.ok) {
                console.error('Failed to send for', inv.id, await emailRes.text())
                results.push({ id: inv.id, success: false })
                continue
            }

            // Update DB
            await supabase
                .from('invoices')
                .update({
                    last_reminder_sent_at: new Date().toISOString(),
                    reminder_count: inv.reminder_count + 1,
                    status: 'overdue' // Enforce overdue status
                })
                .eq('id', inv.id)

            results.push({ id: inv.id, success: true })
        }

        return new Response(
            JSON.stringify({ processed: overdues.length, results }),
            { headers: { "Content-Type": "application/json" } },
        )
    } catch (err) {
        console.error(err)
        return new Response(String(err?.message ?? err), { status: 500 })
    }
})
