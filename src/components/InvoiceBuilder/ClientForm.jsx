import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { validateBEVAT } from '../../utils/validators';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const ClientForm = ({ defaultValues, onChange }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [clients, setClients] = useState([]);
    const [loadingClients, setLoadingClients] = useState(false);

    const { register, watch, reset, formState: { errors } } = useForm({
        defaultValues
    });

    // Reset form when external defaultValues changes (e.g. from parent state)
    useEffect(() => {
        if (defaultValues && defaultValues.companyName !== undefined) {
            reset(defaultValues, { keepDefaultValues: true });
        }
    }, [defaultValues.companyName, defaultValues.vatNumber, defaultValues.address, defaultValues.email, reset]);

    // Fetch saved clients if logged in
    useEffect(() => {
        const fetchClients = async () => {
            if (!user) return;
            setLoadingClients(true);
            try {
                const { data, error } = await supabase
                    .from('clients')
                    .select('*')
                    .eq('profile_id', user.id)
                    .order('company_name', { ascending: true });

                if (!error && data) {
                    setClients(data);
                }
            } catch (err) {
                console.error("Error fetching clients:", err);
            } finally {
                setLoadingClients(false);
            }
        };

        fetchClients();
    }, [user]);

    // Removed handleClientSelect as datalist is used now

    useEffect(() => {
        const subscription = watch((value) => {
            onChange(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, onChange]);

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 mt-6">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-bold text-text">
                    {t('invoice.client_section')}
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Name */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('invoice.company_name')}</label>
                    <input
                        list="saved-clients"
                        {...register('companyName', { required: t('invoice.errors.required') })}
                        onChange={(e) => {
                            // First trigger react-hook-form's native onChange
                            register('companyName').onChange(e);

                            // Then check if the user selected a known client
                            const val = e.target.value;
                            const matchedClient = clients.find(c => c.company_name === val);
                            if (matchedClient) {
                                reset({
                                    companyName: matchedClient.company_name,
                                    vatNumber: matchedClient.vat_number || '',
                                    address: matchedClient.address || '',
                                    email: matchedClient.email || ''
                                });
                            }
                        }}
                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                    />

                    {/* Datalist for native autocomplete */}
                    {user && clients.length > 0 && (
                        <datalist id="saved-clients">
                            {clients.map(c => (
                                <option key={c.id} value={c.company_name} />
                            ))}
                        </datalist>
                    )}

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
