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

// Generate a Belgian Structured Reference based on an invoice string identifier
export const generateStructuredReference = (invoiceNumberStr) => {
    if (!invoiceNumberStr) return '';

    // Extract only digits from the invoice number (e.g., F202310-001 -> 202310001)
    const digitsOnly = invoiceNumberStr.replace(/\D/g, '');
    if (!digitsOnly) return '';

    // We need a 10-digit base number. If shorter, pad with zeros. If longer, truncate (or just take last 10).
    const baseNumberStr = digitsOnly.padStart(10, '0').slice(-10);
    const baseNumber = parseInt(baseNumberStr, 10);

    // Calculate modulo 97. If 0, the check digits are 97.
    let mod = baseNumber % 97;
    if (mod === 0) mod = 97;

    const checkDigits = mod.toString().padStart(2, '0');
    const fullNumberStr = baseNumberStr + checkDigits;

    // Format as +++ XXX/XXXX/XXXXX +++
    return `+++ ${fullNumberStr.substring(0, 3)}/${fullNumberStr.substring(3, 7)}/${fullNumberStr.substring(7, 12)} +++`;
};
