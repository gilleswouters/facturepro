// Parse a number from input that might contain commas
export const parseNumber = (val) => {
    if (typeof val === 'number') return val;
    if (!val) return 0;
    return parseFloat(val.toString().replace(',', '.')) || 0;
};

// Calculate the total for a single line item
export const calcLineTotal = (qty, unitPrice) => parseNumber(qty) * parseNumber(unitPrice);

// Calculate the VAT amount for a given line item and VAT rate
export const calcVATAmount = (lineTotal, vatRate) => lineTotal * (vatRate / 100);

// Calculate the total sum of all line items without VAT
export const calcSubtotal = (lines) => lines.reduce((sum, l) => sum + calcLineTotal(l.qty, l.unitPrice), 0);

// Calculate the grand total VAT for all line items
export const calcTotalVAT = (lines) => lines.reduce((sum, l) => sum + calcVATAmount(calcLineTotal(l.qty, l.unitPrice), l.vatRate), 0);

// Calculate the final total including VAT
export const calcGrandTotal = (subtotal, totalVAT) => subtotal + totalVAT;

// Format an amount correctly as Belgian EUR currency
export const formatEUR = (amount) => {
    const formatted = amount.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // jsPDF cannot render the narrow no-break space (U+202F) or no-break space (U+00A0)
    // used by toLocaleString in French locales for the thousands separator.
    // We replace it with a standard space ' '.
    return formatted.replace(/[\u202F\u00A0]/g, ' ') + ' €';
};
