import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateBEVAT, validateIBAN } from '../../utils/validators';

const SellerForm = ({ defaultValues, onChange }) => {
    const { t } = useTranslation();
    const { register, watch, reset, formState: { errors } } = useForm({
        defaultValues
    });

    // Reset form when defaultValues changes (e.g. profile loaded from Supabase)
    useEffect(() => {
        if (defaultValues && defaultValues.companyName !== undefined) {
            // Only reset if it's the initial load from Supabase (form is currently empty but defaultValues has data)
            // Or if we are explicitly replacing the entire form data from a saved client
            reset(defaultValues, { keepDefaultValues: true });
        }
    }, [defaultValues.companyName, defaultValues.vatNumber, defaultValues.address, defaultValues.email, defaultValues.iban, reset]);

    useEffect(() => {
        const subscription = watch((value) => {
            onChange(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, onChange]);

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8">
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">
                {t('invoice.seller_section')}
            </h2>

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

                {/* IBAN */}
                <div className="col-span-1 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.iban')}</label>
                    <input
                        {...register('iban', {
                            required: t('invoice.errors.required'),
                            validate: (val) => validateIBAN(val) || t('invoice.errors.invalid_iban')
                        })}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors uppercase"
                    />
                    {errors.iban && <span className="text-xs text-red-500">{errors.iban.message}</span>}
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

                {/* Email */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.email')}</label>
                    <input
                        type="email"
                        {...register('email', { required: t('invoice.errors.required') })}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                </div>
            </div>
        </div>
    );
};

export default SellerForm;
