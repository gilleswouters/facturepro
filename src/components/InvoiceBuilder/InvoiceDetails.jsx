import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const InvoiceDetails = ({ defaultValues, onChange }) => {
    const { t } = useTranslation();
    const { register, watch, formState: { errors } } = useForm({
        defaultValues
    });

    useEffect(() => {
        const subscription = watch((value) => {
            onChange(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, onChange]);

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 mt-6">
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">
                {t('invoice.details_section')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Invoice Number */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.invoice_number')}</label>
                    <input
                        {...register('invoiceNumber', { required: t('invoice.errors.required') })}
                        placeholder="2026-001"
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.invoiceNumber && <span className="text-xs text-red-500">{errors.invoiceNumber.message}</span>}
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.issue_date')}</label>
                    <input
                        type="date"
                        {...register('issueDate', { required: t('invoice.errors.required') })}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.issueDate && <span className="text-xs text-red-500">{errors.issueDate.message}</span>}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.due_date')}</label>
                    <input
                        type="date"
                        {...register('dueDate', { required: t('invoice.errors.required') })}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.dueDate && <span className="text-xs text-red-500">{errors.dueDate.message}</span>}
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetails;
