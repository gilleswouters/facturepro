import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePDF } from '../utils/pdfGenerator';
import brand from '../config/brand';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const FREE_MONTHLY_LIMIT = 5;

const usePDF = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
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
                brand.domain
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
                    await supabase.from('invoices').insert({
                        profile_id: user.id,
                        invoice_number: invoiceData.details.invoiceNumber || `PRO-${Date.now()}`,
                        invoice_data: {
                            seller: invoiceData.seller,
                            client: invoiceData.client,
                            details: invoiceData.details,
                            lines: invoiceData.lines,
                            notes: invoiceData.notes,
                            totals: totals
                        }
                    });
                } catch (dbError) {
                    console.error("Failed to save invoice to history", dbError);
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
