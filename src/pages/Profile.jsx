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
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Form state corresponding to the profiles table
    const [formData, setFormData] = useState({
        company_name: '',
        address: '',
        vat_number: '',
        iban: '',
        default_notes: '',
        invoice_number_format: '{YEAR}-{NUM}',
        brand_color: '#3B82F6',
        logo_url: ''
    });

    // Populate form when profile data loads
    useEffect(() => {
        if (profile) {
            setFormData({
                company_name: profile.company_name || '',
                address: profile.address || '',
                vat_number: profile.vat_number || '',
                iban: profile.iban || '',
                default_notes: profile.default_notes || '',
                invoice_number_format: profile.invoice_number_format || '{YEAR}-{NUM}',
                brand_color: profile.brand_color || '#3B82F6',
                logo_url: profile.logo_url || ''
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage({ text: 'Veuillez sélectionner une image (JPG/PNG).', type: 'error' });
            return;
        }

        setUploadingLogo(true);
        setMessage({ text: '', type: '' });

        try {
            // Resize image via canvas to max 300px width / 150px height
            const resizedBlob = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxW = 300;
                    const maxH = 150;

                    if (width > maxW) {
                        height = Math.round((height * maxW) / width);
                        width = maxW;
                    }
                    if (height > maxH) {
                        width = Math.round((width * maxH) / height);
                        height = maxH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.9);
                };
                img.onerror = reject;
                img.src = URL.createObjectURL(file);
            });

            const filePath = `${user.id}/logo.png`;

            // Upload resized image to Supabase Storage buffer
            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, resizedBlob, {
                    cacheControl: '3600',
                    upsert: true,
                    contentType: 'image/png'
                });

            if (uploadError) throw uploadError;

            // Get the public URL to instantly render it
            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath);

            const timestampedUrl = `${publicUrl}?t=${Date.now()}`;
            setFormData(prev => ({ ...prev, logo_url: timestampedUrl }));
            setMessage({ text: 'Logo uploadé avec succès. N\'oubliez pas d\'enregistrer.', type: 'success' });
        } catch (error) {
            console.error('Error uploading logo:', error);
            setMessage({ text: 'Erreur lors de l\'upload du logo.', type: 'error' });
        } finally {
            setUploadingLogo(false);
        }
    };

    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo_url: '' }));
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
                    invoice_number_format: formData.invoice_number_format,
                    brand_color: formData.brand_color,
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

                                {profile?.subscription_status === 'pro' && (
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-semibold text-slate-700">
                                                Couleur de Marque (Facture) <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 ml-2">PRO</span>
                                            </label>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="color"
                                                name="brand_color"
                                                value={formData.brand_color}
                                                onChange={handleChange}
                                                className="h-10 w-14 cursor-pointer rounded bg-surface border border-border"
                                                title="Choisir une couleur"
                                            />
                                            <div className="text-sm text-slate-500">
                                                Cette couleur sera utilisée pour styliser les titres et le tableau de votre PDF.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <hr className="border-border" />

                            {profile?.subscription_status === 'pro' && (
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                        Logo de l'Entreprise <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">PRO</span>
                                    </h3>

                                    <div className="flex flex-col sm:flex-row items-start gap-6">
                                        {/* Preview box */}
                                        <div className="relative w-full sm:w-64 h-32 rounded-xl border-2 border-dashed border-border bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 group">
                                            {formData.logo_url ? (
                                                <>
                                                    <img src={formData.logo_url} alt="Logo" className="max-w-[80%] max-h-[80%] object-contain" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={handleRemoveLogo}
                                                            className="text-white bg-red-500 hover:bg-red-600 rounded-lg px-3 py-1.5 text-xs font-medium"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="text-slate-400 text-sm flex flex-col items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    Aucun logo
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <p className="text-sm text-slate-500">
                                                Uploadez votre logo au format JPG ou PNG. L'image sera automatiquement redimensionnée et affichée en haut à droite de vos factures.
                                            </p>

                                            <div className="relative mt-2">
                                                <input
                                                    type="file"
                                                    accept="image/png, image/jpeg, image/jpg"
                                                    onChange={handleLogoUpload}
                                                    disabled={uploadingLogo}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={uploadingLogo}
                                                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-border hover:bg-slate-50 ${uploadingLogo ? 'opacity-50' : ''}`}
                                                >
                                                    {uploadingLogo ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Upload en cours...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                            </svg>
                                                            Choisir un fichier
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

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

                                {profile?.subscription_status === 'pro' && (
                                    <div className="space-y-1 pt-4 border-t border-border">
                                        <label className="text-sm font-semibold text-slate-700 flex justify-between">
                                            <span>Format Numéro de Facture <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 ml-2">PRO</span></span>
                                        </label>
                                        <div className="flex flex-col md:flex-row gap-4 items-start">
                                            <div className="flex-1 w-full">
                                                <input
                                                    type="text"
                                                    name="invoice_number_format"
                                                    value={formData.invoice_number_format}
                                                    onChange={handleChange}
                                                    className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-mono focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                                    placeholder="{YEAR}-{NUM}"
                                                />
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Variables: <code className="bg-slate-100 px-1 py-0.5 rounded text-brand">{"{YEAR}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand">{"{MONTH}"}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-brand">{"{NUM}"}</code>
                                                </p>
                                            </div>
                                            <div className="bg-slate-50 p-4 rounded-lg border border-border w-full md:w-64 shrink-0">
                                                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Aperçu</div>
                                                <div className="font-mono text-sm font-medium text-slate-900">
                                                    {(formData.invoice_number_format || '{YEAR}-{NUM}')
                                                        .replace('{YEAR}', new Date().getFullYear())
                                                        .replace('{MONTH}', String(new Date().getMonth() + 1).padStart(2, '0'))
                                                        .replace('{NUM}', '042')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
