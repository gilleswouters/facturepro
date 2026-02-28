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

    // Handle selecting a saved client
    const handleClientSelect = (e) => {
        const clientId = e.target.value;
        if (!clientId) {
            // Emptied selection - optionally clear form, but usually better to leave as is
            return;
        }

        const selectedClient = clients.find(c => c.id === clientId);
        if (selectedClient) {
            reset({
                companyName: selectedClient.company_name || '',
                vatNumber: selectedClient.vat_number || '',
                address: selectedClient.address || '',
                email: selectedClient.email || ''
            });
        }
    };

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
                {user && clients.length > 0 && (
                    <select
                        onChange={handleClientSelect}
                        className="rounded-lg border border-border bg-surface px-4 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
                        defaultValue=""
                    >
                        <option value="" disabled>Choisir un client enregistré...</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.company_name}
                            </option>
                        ))}
                    </select>
                )}
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
