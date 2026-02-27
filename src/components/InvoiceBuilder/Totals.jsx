import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatEUR } from '../../utils/calculations';

const Totals = ({ totals }) => {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 mt-6">
            <div className="flex flex-col md:flex-row md:justify-end">
                <div className="w-full md:w-1/2 space-y-4">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-semibold text-muted text-sm uppercase tracking-wider">{t('invoice.total_ht')}</span>
                        <span className="font-mono text-lg font-bold text-text">{formatEUR(totals.subtotal)}</span>
                    </div>

                    {/* VAT */}
                    <div className="flex items-center justify-between border-b border-border pb-3">
                        <span className="font-semibold text-muted text-sm uppercase tracking-wider">{t('invoice.vat_amount', { rate: '' }).replace('()', '').trim()}</span>
                        <span className="font-mono text-lg font-bold text-text">{formatEUR(totals.vatTotal)}</span>
                    </div>

                    {/* Grand Total */}
                    <div className="flex items-center justify-between rounded-xl bg-brand-light/30 p-4">
                        <span className="font-bold text-brand text-lg">{t('invoice.total_ttc')}</span>
                        <span className="font-mono text-2xl font-bold text-brand">{formatEUR(totals.grandTotal)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Totals;
