import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePDF } from '../utils/pdfGenerator';
import brand from '../config/brand';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FREE_MONTHLY_LIMIT = 5;

const usePDF = () => {
    const { t } = useTranslation();
    const { user, profile } = useAuth();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [monthlyCount, setMonthlyCount] = useState(0);

    // Initialize local storage counter
    useEffect(() => {
        const storedData = localStorage.getItem(`${brand.name}_pdf_usage`);
        if (storedData) {
            try {
                const { count, month, year } = JSON.parse(storedData);
                const now = new Date();
                // Reset counter if it's a new month/year
                if (month === now.getMonth() && year === now.getFullYear()) {
                    setMonthlyCount(count);
                } else {
                    setMonthlyCount(0);
                    localStorage.setItem(`${brand.name}_pdf_usage`, JSON.stringify({ count: 0, month: now.getMonth(), year: now.getFullYear() }));
                }
            } catch (e) {
                setMonthlyCount(0);
            }
        }
    }, []);

    const incrementUsageCounter = () => {
        const newCount = monthlyCount + 1;
        setMonthlyCount(newCount);
        const now = new Date();
        localStorage.setItem(`${brand.name}_pdf_usage`, JSON.stringify({
            count: newCount,
            month: now.getMonth(),
            year: now.getFullYear()
        }));
    };

    const downloadPDF = async (invoiceData, totals, isPro = false) => {
        setIsGenerating(true);
        setError(null);

        if (!isPro && monthlyCount >= FREE_MONTHLY_LIMIT) {
            setError(t('builder.free_limit_reached'));
            setIsGenerating(false);
            return false;
        }

        try {
            // Slight delay to allow UI to show loading state if needed
            await new Promise(resolve => setTimeout(resolve, 50));

            const success = generatePDF(
                invoiceData,
                totals,
                isPro,
                brand.name,
                brand.domain,
                // Pass custom branding only for Pro users
                isPro ? user?.user_metadata?.logo_url || invoiceData.seller?.logo_url : null, // We will pull this from profile directly via useAuth but here we need to ensure we pass it correctly. Use profile context.
                isPro ? invoiceData.seller?.brand_color : null
            );

            if (!success) {
                throw new Error("Failed to generate PDF document.");
            }

            // Only increment limit if it's a free generation
            if (!isPro) {
                incrementUsageCounter();
            } else if (user) {
                // Save to database for Pro users
                try {
                    // 1. Save invoice history
                    const invoicePayload = {
                        profile_id: user.id,
                        invoice_number: invoiceData.details.invoiceNumber || `PRO-${Date.now()}`,
                        client_name: invoiceData.client?.companyName || 'Client Inconnu',
                        total_amount: totals.grandTotal || 0,
                        issue_date: invoiceData.details.issueDate || new Date().toISOString().split('T')[0],
                        data_snapshot: {
                            seller: invoiceData.seller,
                            client: invoiceData.client,
                            details: invoiceData.details,
                            lines: invoiceData.lines,
                            notes: invoiceData.notes,
                            totals: totals,
                            branding: {
                                logo_url: profile?.logo_url || null,
                                brand_color: profile?.brand_color || null
                            }
                        }
                    };

                    const { error: invoiceError } = await supabase.from('invoices').insert(invoicePayload);
                    if (invoiceError) throw invoiceError;

                    // 2. Auto-save client if company name is provided
                    if (invoiceData.client && invoiceData.client.companyName) {
                        const { data: existingClients } = await supabase.from('clients')
                            .select('id')
                            .eq('profile_id', user.id)
                            .ilike('company_name', invoiceData.client.companyName)
                            .limit(1);

                        if (!existingClients || existingClients.length === 0) {
                            await supabase.from('clients').insert([{
                                profile_id: user.id,
                                company_name: invoiceData.client.companyName,
                                vat_number: invoiceData.client.vatNumber || '',
                                address: invoiceData.client.address || '',
                                email: invoiceData.client.email || ''
                            }]);
                        }
                    }

                    // 3. Auto-save products
                    if (invoiceData.lines && invoiceData.lines.length > 0) {
                        for (const line of invoiceData.lines) {
                            if (line.description && line.description.trim() !== '') {
                                const { data: existingProducts } = await supabase.from('products')
                                    .select('id')
                                    .eq('profile_id', user.id)
                                    .ilike('description', line.description.trim())
                                    .limit(1);

                                if (!existingProducts || existingProducts.length === 0) {
                                    // Parse numeric values to handle potential comma inputs before saving
                                    const parsedPrice = parseFloat(String(line.unitPrice).replace(',', '.')) || 0;
                                    const parsedVat = parseFloat(line.vatRate) || 0;

                                    await supabase.from('products').insert([{
                                        profile_id: user.id,
                                        description: line.description.trim(),
                                        default_price: parsedPrice,
                                        vat_rate: parsedVat
                                    }]);
                                }
                            }
                        }
                    }
                } catch (dbError) {
                    console.error("Failed to save to history or catalogue", dbError);
                    alert("Erreur lors de la sauvegarde de la facture dans l'historique : " + (dbError?.message || 'Erreur inconnue'));
                    // We don't block the download if the save fails, just log it.
                }
            }

            return true;
        } catch (err) {
            console.error(err);
            setError(err.message || t('errors.generic'));
            return false;
        } finally {
            setIsGenerating(false);
        }
    };

    const remainingFree = Math.max(0, FREE_MONTHLY_LIMIT - monthlyCount);

    return { downloadPDF, isGenerating, error, remainingFree, isLimitReached: monthlyCount >= FREE_MONTHLY_LIMIT };
};

export default usePDF;
