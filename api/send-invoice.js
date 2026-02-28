import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            to,
            invoiceNumber,
            clientName,
            pdfBase64,
            sellerName,
            replyTo
        } = req.body;

        if (!to || !pdfBase64 || !invoiceNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const brandName = sellerName || 'FacturePro';

        const { data, error } = await resend.emails.send({
            from: `${brandName} <factures@factuurpro.be>`,
            to: [to],
            replyTo: replyTo || 'noreply@factuurpro.be',
            subject: `Nouvelle Facture de ${brandName} - N° ${invoiceNumber}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bonjour ${clientName || 'Client'},</h2>
          <p>Veuillez trouver ci-joint votre facture <strong>N° ${invoiceNumber}</strong> émise par ${brandName}.</p>
          <p>Le document PDF attaché contient tous les détails nécessaires ainsi que les instructions de paiement.</p>
          <br/>
          <p>Cordialement,</p>
          <p><strong>${brandName}</strong></p>
          <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #666;">
            Cet email a été envoyé de manière sécurisée via FacturePro.be / FactuurPro.be
          </p>
        </div>
      `,
            attachments: [
                {
                    filename: `Facture_${invoiceNumber}.pdf`,
                    content: pdfBase64,
                },
            ],
        });

        if (error) {
            console.error('Resend Error:', error);
            return res.status(400).json(error);
        }

        return res.status(200).json({ success: true, data });
    } catch (err) {
        console.error('Unexpected email error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
