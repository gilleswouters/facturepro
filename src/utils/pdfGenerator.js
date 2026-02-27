import jsPDF from 'jspdf';
import { formatEUR, parseNumber } from './calculations';

export const generatePDF = (invoiceData, totals, isPro = false, brandName, domain) => {
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 18; // 18mm margin
        const contentWidth = pageWidth - margin * 2;

        // --- Header Bar ---
        // Brand Color: #1D4ED8 (rgb: 29, 78, 216)
        doc.setFillColor(29, 78, 216);
        doc.rect(0, 0, pageWidth, 28, 'F');

        // Title text inside header
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('FACTURE', margin, 18);

        // Document styling defaults
        doc.setTextColor(15, 23, 42); // slate-900 (--text)

        // --- Seller Info ---
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        let yPos = 40;

        if (invoiceData.seller.companyName) {
            doc.text(invoiceData.seller.companyName, margin, yPos);
            yPos += 5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (invoiceData.seller.address) {
            const addressLines = doc.splitTextToSize(invoiceData.seller.address, contentWidth / 2);
            doc.text(addressLines, margin, yPos);
            yPos += (addressLines.length * 5);
        }

        if (invoiceData.seller.vatNumber) {
            doc.text(`TVA: ${invoiceData.seller.vatNumber}`, margin, yPos);
            yPos += 5;
        }
        if (invoiceData.seller.email) {
            doc.text(invoiceData.seller.email, margin, yPos);
        }

        // --- Client Info (Aligned Right) ---
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text('FACTURÉ À :', pageWidth - margin - (contentWidth / 2.5), 40);

        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        let rightYPos = 46;

        if (invoiceData.client.companyName) {
            doc.text(invoiceData.client.companyName, pageWidth - margin - (contentWidth / 2.5), rightYPos);
            rightYPos += 5;
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        if (invoiceData.client.address) {
            const clientAddressLines = doc.splitTextToSize(invoiceData.client.address, contentWidth / 2.5);
            doc.text(clientAddressLines, pageWidth - margin - (contentWidth / 2.5), rightYPos);
            rightYPos += (clientAddressLines.length * 5);
        }

        if (invoiceData.client.vatNumber) {
            doc.text(`TVA: ${invoiceData.client.vatNumber}`, pageWidth - margin - (contentWidth / 2.5), rightYPos);
            rightYPos += 5;
        }
        if (invoiceData.client.email) {
            doc.text(invoiceData.client.email, pageWidth - margin - (contentWidth / 2.5), rightYPos);
        }

        // --- Invoice Details (Aligned Right, below client) ---
        rightYPos += 10;
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(9);
        doc.text(`N° Facture :`, pageWidth - margin - (contentWidth / 2.5), rightYPos);
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.text(invoiceData.details.invoiceNumber || '-', pageWidth - margin, rightYPos, { align: 'right' });

        rightYPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(`Date d'émission :`, pageWidth - margin - (contentWidth / 2.5), rightYPos);
        doc.setTextColor(15, 23, 42);
        doc.text(invoiceData.details.issueDate || '-', pageWidth - margin, rightYPos, { align: 'right' });

        rightYPos += 5;
        doc.setTextColor(100, 116, 139);
        doc.text(`Date d'échéance :`, pageWidth - margin - (contentWidth / 2.5), rightYPos);
        doc.setTextColor(15, 23, 42);
        doc.text(invoiceData.details.dueDate || '-', pageWidth - margin, rightYPos, { align: 'right' });

        // Sync highest Y position
        yPos = Math.max(yPos + 15, rightYPos + 15);

        // --- Table Header ---
        doc.setFillColor(15, 23, 42); // #0F172A
        doc.rect(margin, yPos, contentWidth, 10, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');

        doc.text('Description', margin + 3, yPos + 6.5);
        doc.text('Qté', margin + contentWidth * 0.45, yPos + 6.5);
        doc.text('Prix Unit.', margin + contentWidth * 0.60, yPos + 6.5);
        doc.text('TVA', margin + contentWidth * 0.75, yPos + 6.5);
        doc.text('Total', margin + contentWidth - 3, yPos + 6.5, { align: 'right' });

        // --- Table Rows ---
        yPos += 10;
        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'normal');

        invoiceData.lines.forEach((line, i) => {
            // Background for alternate rows
            if (i % 2 !== 0) {
                doc.setFillColor(248, 250, 252); // surface color
                doc.rect(margin, yPos, contentWidth, 10, 'F');
            }

            const descLines = doc.splitTextToSize(line.description || '-', contentWidth * 0.40);

            // Calculate row height based on description length
            const rowHeight = Math.max(10, descLines.length * 5 + 4);

            if (yPos + rowHeight > pageHeight - 40) {
                doc.addPage();
                yPos = margin;
            }

            doc.text(descLines, margin + 3, yPos + 6);
            doc.text(line.qty.toString(), margin + contentWidth * 0.45, yPos + 6);
            doc.text(formatEUR(parseNumber(line.unitPrice)), margin + contentWidth * 0.60, yPos + 6);
            doc.text(`${line.vatRate}%`, margin + contentWidth * 0.75, yPos + 6);

            const lineTotal = parseNumber(line.qty) * parseNumber(line.unitPrice);
            doc.text(formatEUR(lineTotal), margin + contentWidth - 3, yPos + 6, { align: 'right' });

            yPos += rowHeight;
        });

        // --- Totals Box ---
        yPos += 10;

        if (yPos + 40 > pageHeight - 40) {
            doc.addPage();
            yPos = margin;
        }

        const totalsX = pageWidth - margin - 80;

        doc.setFillColor(219, 234, 254); // #DBEAFE
        doc.rect(totalsX, yPos, 80, 26, 'F');

        let totalsY = yPos + 7;
        doc.setFontSize(10);

        doc.text('Sous-total HT', totalsX + 4, totalsY);
        doc.text(formatEUR(totals.subtotal), totalsX + 76, totalsY, { align: 'right' });

        totalsY += 6;
        doc.text('TVA', totalsX + 4, totalsY);
        doc.text(formatEUR(totals.vatTotal), totalsX + 76, totalsY, { align: 'right' });

        totalsY += 8;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(29, 78, 216); // brand blue
        doc.text('Total TTC', totalsX + 4, totalsY);
        doc.text(formatEUR(totals.grandTotal), totalsX + 76, totalsY, { align: 'right' });

        // --- IBAN Payment info ---
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        if (invoiceData.seller.iban) {
            doc.text(`Paiement sur le compte : ${invoiceData.seller.iban}`, margin, yPos + 5);
        }

        // --- Notes & Legal ---
        yPos += 45;
        if (invoiceData.notes) {
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            const notesLines = doc.splitTextToSize(invoiceData.notes, contentWidth);
            doc.text(notesLines, margin, yPos);
        }

        // --- Watermark ---
        if (!isPro) {
            doc.setFontSize(7);
            doc.setTextColor(200, 210, 220);

            // Default to fr if brand language is not specified
            const watermarkText = brandName === 'FactuurPro'
                ? `Gratis aangemaakt op ${domain} — Upgrade naar Pro om dit te verwijderen`
                : `Créé gratuitement sur ${domain} — Passez en Pro pour supprimer ce message`;

            doc.text(watermarkText, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }

        // Save PDF
        const fileName = `Facture_${invoiceData.details.invoiceNumber || 'brouillon'}.pdf`.replace(/\s+/g, '_');
        doc.save(fileName);
        return true;

    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};
