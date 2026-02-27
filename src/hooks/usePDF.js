import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { generatePDF } from '../utils/pdfGenerator';
import brand from '../config/brand';

const usePDF = () => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const downloadPDF = async (invoiceData, totals, isPro = false) => {
        setIsGenerating(true);
        setError(null);

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
        } catch (err) {
            console.error(err);
            setError(err.message || t('errors.generic'));
        } finally {
            setIsGenerating(false);
        }
    };

    return { downloadPDF, isGenerating, error };
};

export default usePDF;
