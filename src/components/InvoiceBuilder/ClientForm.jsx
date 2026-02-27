import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateBEVAT } from '../../utils/validators';

const ClientForm = ({ defaultValues, onChange }) => {
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
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-text">
                    {t('invoice.client_section')}
                </h2>
                {/* Placeholder for "Choose from saved clients" (Phase 2) */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.company_name')}</label>
                    <input
                        {...register('companyName', { required: t('invoice.errors.required') })}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.companyName && <span className="text-xs text-red-500">{errors.companyName.message}</span>}
                </div>

                {/* VAT Number */}
                <div className="col-span-1 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.vat_number')}</label>
                    <input
                        {...register('vatNumber', {
                            required: t('invoice.errors.required'),
                            validate: (val) => validateBEVAT(val) || t('invoice.errors.invalid_vat')
                        })}
                        placeholder="BE0123456789"
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.vatNumber && <span className="text-xs text-red-500">{errors.vatNumber.message}</span>}
                </div>

                {/* Email */}
                <div className="col-span-1 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.email')}</label>
                    <input
                        type="email"
                        {...register('email')}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                </div>

                {/* Address */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.address')}</label>
                    <textarea
                        {...register('address', { required: t('invoice.errors.required') })}
                        rows="2"
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.address && <span className="text-xs text-red-500">{errors.address.message}</span>}
                </div>
            </div>
        </div>
    );
};

export default ClientForm;
