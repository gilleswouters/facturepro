import jsPDF from 'jspdf';
import { formatEUR, parseNumber } from './calculations';

export const generatePDF = async (invoiceData, totals, isPro = false, brandName, domain, logoUrl = null, brandColor = null, returnType = 'save') => {
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

        // --- Helper for Hex to RGB conversion ---
        const hexToRgb = (hex) => {
            if (!hex) return [29, 78, 216]; // Default blue
            hex = hex.replace(/^#/, '');
            if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
            const bigint = parseInt(hex, 16);
            return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
        };
        const activeColor = hexToRgb(brandColor);

        // --- Header Bar ---
        doc.setFillColor(activeColor[0], activeColor[1], activeColor[2]);
        doc.rect(0, 0, pageWidth, 28, 'F');

        // Document styling defaults
        doc.setTextColor(15, 23, 42); // slate-900 (--text)

        // --- Title / Logo ---
        if (logoUrl) {
            try {
                // Since logoUrl is base64 from the serverless function OR URL from Supabase 
                // We use addImage. If it's a URL we technically should load it, which implies generatePDF should be async.
                // Assuming logo_url passed from usePDF/Dashboard is already a URL string or base64.
                // If it's an external URL, the image needs to be loaded by jsPDF (which takes base64 ideally, or it tries to fetch but can fail on CORS).
                // Assuming it's base64 for now, or use JS to fetch and convert to blob here before running.
                const img = new Image();
                img.crossOrigin = "Anonymous";
                await new Promise((resolve, reject) => {
                    img.onload = () => resolve();
                    img.onerror = () => reject(new Error('Image failed to load'));
                    img.src = logoUrl;
                });

                // Calculate dimensions to fit in max 50x20 box
                const maxW = 50;
                const maxH = 20;
                let w = img.width;
                let h = img.height;
                const ratio = Math.min(maxW / w, maxH / h);
                w = w * ratio;
                h = h * ratio;

                // Positioned on the right inside or below header? 
                // Let's position it top right inside the header, or standalone top right.
                // If top right, y = 4. Wait, the header background is there. Let's put it at Y=4, X=pageWidth-margin-w.
                doc.addImage(img, 'PNG', pageWidth - margin - w, 4, w, h);

                // Add "FACTURE" text normally on the left
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(20);
                doc.text('FACTURE', margin, 18);
            } catch (e) {
                console.error("Failed to load PDF logo", e);
                // Fallback
                doc.setTextColor(255, 255, 255);
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(20);
                doc.text('FACTURE', margin, 18);
            }
        } else {
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(20);
            doc.text('FACTURE', margin, 18);
        }

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
        doc.setTextColor(activeColor[0], activeColor[1], activeColor[2]); // brand custom
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

        if (returnType === 'base64') {
            // Return base64 string without the data URI prefix for the Resend API
            const dataUri = doc.output('datauristring');
            return dataUri.split(',')[1];
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
