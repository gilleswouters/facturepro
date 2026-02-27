import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { calcSubtotal, calcTotalVAT, calcGrandTotal } from '../utils/calculations';

const useInvoice = () => {
    const { t } = useTranslation();

    // Initial shape of our invoice data
    const [invoiceData, setInvoiceData] = useState({
        seller: {
            companyName: '',
            vatNumber: '',
            address: '',
            email: '',
            iban: ''
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
        notes: t('invoice.default_notes')
    });

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
