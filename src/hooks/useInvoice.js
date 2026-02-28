import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { calcSubtotal, calcTotalVAT, calcGrandTotal } from '../utils/calculations';

const useInvoice = (initialProfile = null) => {
    const { t } = useTranslation();

    // Initial shape of our invoice data
    const [invoiceData, setInvoiceData] = useState({
        seller: {
            companyName: initialProfile?.company_name || '',
            vatNumber: initialProfile?.vat_number || '',
            address: initialProfile?.address || '',
            email: initialProfile?.email || '', // Optional email if available
            iban: initialProfile?.iban || ''
        },
        client: {
            companyName: '',
            vatNumber: '',
            address: '',
            email: ''
        },
        details: {
            invoiceNumber: '',
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        lines: [
            { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0, vatRate: 21 }
        ],
        notes: initialProfile?.default_notes !== undefined ? initialProfile.default_notes : t('invoice.default_notes')
    });

    // Update form if profile loads *after* hook initialization
    // We bind to specific string values rather than the entire `initialProfile` object 
    // to prevent infinite re-renders when the AuthContext object reference changes.
    useEffect(() => {
        if (initialProfile?.id) {
            setInvoiceData(prev => {
                // Only overwrite if the current form is completely empty (haven't started typing)
                if (!prev.seller.companyName && !prev.seller.vatNumber && !prev.seller.address) {
                    return {
                        ...prev,
                        seller: {
                            ...prev.seller,
                            companyName: initialProfile.company_name || '',
                            vatNumber: initialProfile.vat_number || '',
                            address: initialProfile.address || '',
                            iban: initialProfile.iban || ''
                        },
                        details: {
                            ...prev.details,
                            // Use profile format if available, otherwise fallback
                            invoiceNumber: !prev.details.invoiceNumber ? (initialProfile.invoice_number_format || '{YEAR}-{NUM}')
                                .replace('{YEAR}', new Date().getFullYear())
                                .replace('{MONTH}', String(new Date().getMonth() + 1).padStart(2, '0'))
                                .replace('{NUM}', '001') : prev.details.invoiceNumber
                        },
                        notes: initialProfile.default_notes || prev.notes
                    };
                }
                return prev;
            });
        }
    }, [
        initialProfile?.id,
        initialProfile?.company_name,
        initialProfile?.vat_number,
        initialProfile?.address,
        initialProfile?.iban,
        initialProfile?.default_notes,
        initialProfile?.invoice_number_format
    ]);

    // Derived totals
    const [totals, setTotals] = useState({ subtotal: 0, vatTotal: 0, grandTotal: 0 });

    // Update totals whenever lines change
    useEffect(() => {
        const subtotal = calcSubtotal(invoiceData.lines);
        const vatTotal = calcTotalVAT(invoiceData.lines);
        const grandTotal = calcGrandTotal(subtotal, vatTotal);

        setTotals({ subtotal, vatTotal, grandTotal });
    }, [invoiceData.lines]);

    // Handle updates to specific sections
    const updateSection = useCallback((section, data) => {
        setInvoiceData(prev => ({
            ...prev,
            [section]: { ...prev[section], ...data }
        }));
    }, []);

    const updateNotes = useCallback((notes) => {
        setInvoiceData(prev => ({ ...prev, notes }));
    }, []);

    // Line item operations
    const addLineItem = useCallback(() => {
        setInvoiceData(prev => ({
            ...prev,
            lines: [
                ...prev.lines,
                { id: crypto.randomUUID(), description: '', qty: 1, unitPrice: 0, vatRate: 21 }
            ]
        }));
    }, []);

    const updateLineItem = useCallback((id, field, value) => {
        setInvoiceData(prev => ({
            ...prev,
            lines: prev.lines.map(line =>
                line.id === id ? { ...line, [field]: value } : line
            )
        }));
    }, []);

    const removeLineItem = useCallback((id) => {
        setInvoiceData(prev => {
            if (prev.lines.length <= 1) return prev; // keeping at least one line
            return {
                ...prev,
                lines: prev.lines.filter(line => line.id !== id)
            };
        });
    }, []);

    return {
        invoiceData,
        totals,
        updateSection,
        updateNotes,
        addLineItem,
        updateLineItem,
        removeLineItem
    };
};

export default useInvoice;
