import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Profile = () => {
    const { t } = useTranslation();
    const { user, profile } = useAuth();

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form state corresponding to the profiles table
    const [formData, setFormData] = useState({
        company_name: '',
        address: '',
        vat_number: '',
        iban: '',
        default_notes: ''
    });

    // Populate form when profile data loads
    useEffect(() => {
        if (profile) {
            setFormData({
                company_name: profile.company_name || '',
                address: profile.address || '',
                vat_number: profile.vat_number || '',
                iban: profile.iban || '',
                default_notes: profile.default_notes || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    company_name: formData.company_name,
                    address: formData.address,
                    vat_number: formData.vat_number,
                    iban: formData.iban,
                    default_notes: formData.default_notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ text: t('profile_page.success_msg'), type: 'success' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);

        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ text: t('profile_page.error_msg'), type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow bg-surface py-12">
                <div className="mx-auto max-w-[800px] px-4 md:px-8">

                    <div className="mb-4">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:text-brand-dark transition-colors">
                            {t('profile_page.back_home')}
                        </Link>
                    </div>

                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900">{t('profile_page.title')}</h1>
                            <p className="mt-2 text-slate-500">{t('profile_page.subtitle')}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">

                        {/* Account Details Header */}
                        <div className="bg-slate-50 border-b border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('profile_page.account')}</div>
                                <div className="font-medium text-slate-900">{user?.email}</div>
                            </div>

                            <div>
                                <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('profile_page.current_plan')}</div>
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 uppercase">
                                    {profile?.subscription_status === 'pro' ? 'Pro' : t('profile_page.free_plan')}
                                </span>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">

                            {message.text && (
                                <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900">{t('profile_page.company_details')}</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">{t('profile_page.company_name')}</label>
                                        <input
                                            type="text"
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                            placeholder={t('profile_page.company_name_placeholder')}
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">{t('profile_page.vat_number')}</label>
                                        <input
                                            type="text"
                                            name="vat_number"
                                            value={formData.vat_number}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm uppercase focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                            placeholder="BE0123456789"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">{t('profile_page.address')}</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                        placeholder={t('profile_page.address_placeholder')}
                                    />
                                </div>
                            </div>

                            <hr className="border-border" />

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900">{t('profile_page.payment_info')}</h3>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700">{t('profile_page.iban_default')}</label>
                                    <input
                                        type="text"
                                        name="iban"
                                        value={formData.iban}
                                        onChange={handleChange}
                                        className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm uppercase focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                        placeholder="BE00 0000 0000 0000"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-slate-700 flex justify-between">
                                        <span>{t('profile_page.notes_default')}</span>
                                        <span className="font-normal text-slate-400">{t('profile_page.notes_hint')}</span>
                                    </label>
                                    <textarea
                                        name="default_notes"
                                        value={formData.default_notes}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                        placeholder={t('profile_page.notes_placeholder')}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto rounded-xl bg-brand px-8 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                                >
                                    {loading ? t('profile_page.saving') : t('profile_page.save_btn')}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
