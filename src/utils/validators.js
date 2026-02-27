// Validate Belgian VAT Number
export const validateBEVAT = (vat) => /^BE\s?0\d{3}[.\s]?\d{3}[.\s]?\d{3}$/.test(vat.trim());

// Basic IBAN validation (optional, can be expanded later)
export const validateIBAN = (iban) => /^[a-zA-Z]{2}\d{2}\s?([a-zA-Z0-9]{4}\s?){2,7}[a-zA-Z0-9]{1,4}$/.test(iban.trim());
