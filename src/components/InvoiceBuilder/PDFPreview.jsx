import React from 'react';
import { useTranslation } from 'react-i18next';
import brand from '../../config/brand';
import { formatEUR, parseNumber } from '../../utils/calculations';

const PDFPreview = ({ invoiceData, totals, isPro = false }) => {
    const { t } = useTranslation();

    // A visual representation of the PDF layout
    return (
        <div className="sticky top-24 hidden lg:block overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
            <div className="bg-slate-100 p-4 border-b border-border flex justify-between items-center text-xs font-mono text-muted uppercase tracking-wider">
                <span>{t('builder.preview')}</span>
                <span>{t('builder.a4_format')}</span>
            </div>

            {/* "Paper" container */}
            <div className="relative aspect-[1/1.414] w-full bg-white p-6 shadow-inner text-[10px] leading-relaxed scale-90 origin-top">

                {/* Header Bar */}
                <div className="absolute top-0 left-0 right-0 h-10 w-full bg-brand"></div>

                <div className="relative z-10">
                    <div className="text-xl font-bold text-white mb-8">{t('invoice.title_word')}</div>

                    <div className="flex justify-between mb-8">
                        <div className="w-1/2 pr-4 space-y-1">
                            <div className="font-bold text-[12px]">{invoiceData.seller.companyName || 'Votre Entreprise'}</div>
                            {invoiceData.seller.address && <div className="text-slate-600 whitespace-pre-wrap">{invoiceData.seller.address}</div>}
                            {invoiceData.seller.vatNumber && <div className="text-slate-600">TVA: {invoiceData.seller.vatNumber}</div>}
                            {invoiceData.seller.email && <div className="text-slate-600">{invoiceData.seller.email}</div>}
                        </div>

                        <div className="w-1/2 pl-4 space-y-1 text-right">
                            <div className="text-slate-400 font-bold mb-1">{t('invoice.billed_to')}</div>
                            <div className="font-bold text-[12px]">{invoiceData.client.companyName || '-'}</div>
                            {invoiceData.client.address && <div className="text-slate-600 whitespace-pre-wrap">{invoiceData.client.address}</div>}
                            {invoiceData.client.vatNumber && <div className="text-slate-600">TVA: {invoiceData.client.vatNumber}</div>}

                            <div className="mt-4 pt-2">
                                <div className="flex justify-end gap-2"><span className="text-slate-400">{t('invoice.invoice_number')} :</span> <span className="font-bold">{invoiceData.details.invoiceNumber || '-'}</span></div>
                                <div className="flex justify-end gap-2"><span className="text-slate-400">{t('invoice.issue_date')} :</span> <span>{invoiceData.details.issueDate || '-'}</span></div>
                                <div className="flex justify-end gap-2"><span className="text-slate-400">{t('invoice.due_date')} :</span> <span>{invoiceData.details.dueDate || '-'}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-4">
                        <div className="grid grid-cols-12 gap-2 bg-slate-900 text-white p-2 font-bold mb-1">
                            <div className="col-span-4">{t('invoice.description')}</div>
                            <div className="col-span-2 text-center">{t('invoice.qty')}</div>
                            <div className="col-span-2 text-right">{t('invoice.unit_price')}</div>
                            <div className="col-span-2 text-right">{t('invoice.vat_rate')}</div>
                            <div className="col-span-2 text-right">Total</div>
                        </div>

                        {invoiceData.lines.map((line, i) => (
                            <div key={line.id} className={`grid grid-cols-12 gap-2 p-2 border-b border-slate-100 ${i % 2 !== 0 ? 'bg-slate-50' : ''}`}>
                                <div className="col-span-4 break-words">{line.description || '-'}</div>
                                <div className="col-span-2 text-center">{line.qty}</div>
                                <div className="col-span-2 text-right">{formatEUR(parseNumber(line.unitPrice))}</div>
                                <div className="col-span-2 text-right">{line.vatRate}%</div>
                                <div className="col-span-2 text-right">{formatEUR(parseNumber(line.qty) * parseNumber(line.unitPrice))}</div>
                            </div>
                        ))}
                    </div>

                    {/* Totals Box */}
                    <div className="flex justify-end mb-8">
                        <div className="w-64 bg-brand-light p-3 space-y-1">
                            <div className="flex justify-between"><span className="text-slate-700">{t('invoice.subtotal')}</span> <span>{formatEUR(totals.subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-700">{t('invoice.vat_rate')}</span> <span>{formatEUR(totals.vatTotal)}</span></div>
                            <div className="flex justify-between font-bold text-[12px] text-brand pt-2 mt-1 border-t border-blue-200"><span>{t('invoice.total_ttc')}</span> <span>{formatEUR(totals.grandTotal)}</span></div>
                        </div>
                    </div>

                    {/* Payment Info */}
                    {invoiceData.seller.iban && (
                        <div className="mb-4 text-slate-700">
                            {t('invoice.payment_iban')}<span className="font-bold">{invoiceData.seller.iban}</span>
                        </div>
                    )}

                    {/* Notes */}
                    {invoiceData.notes && (
                        <div className="text-slate-500 text-[8px] whitespace-pre-wrap">
                            {invoiceData.notes}
                        </div>
                    )}

                    {/* Watermark */}
                    {!isPro && (
                        <div className="absolute bottom-4 left-0 right-0 text-center text-slate-300 text-[7px]">
                            {t('builder.watermark', { domain: brand.domain })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PDFPreview;
