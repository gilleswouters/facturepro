import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import brand from '../config/brand';

const Subscription = () => {
    const { t } = useTranslation();
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Use environment variables for the specific language checkout URLs
    // Fallback to the test URL if the environment variable isn't set
    const checkoutUrlFR = import.meta.env.VITE_LS_CHECKOUT_URL_FR || "https://facturepro.lemonsqueezy.com/checkout/buy/661fab72-6aec-4044-9879-bc2249229b55";
    const checkoutUrlNL = import.meta.env.VITE_LS_CHECKOUT_URL_NL || checkoutUrlFR;

    // Pick the correct URL based on the current brand (facturepro vs factuurpro)
    const LEMON_SQUEEZY_CHECKOUT_URL = brand.id === 'factuurpro' ? checkoutUrlNL : checkoutUrlFR;

    const handleCheckout = () => {
        // We pass the user's Supabase ID as custom data to Lemon Squeezy
        // so our webhook knows which profile to upgrade.
        const checkoutUrl = new URL(LEMON_SQUEEZY_CHECKOUT_URL);
        checkoutUrl.searchParams.append('checkout[custom][user_id]', user.id);

        // Redirect to Lemon Squeezy
        window.location.href = checkoutUrl.toString();
    };

    return (
        <div className="bg-surface py-20 min-h-[calc(100vh-80px)]">
            <div className="mx-auto max-w-3xl px-6 text-center">
                <h1 className="font-serif text-4xl font-bold text-text mb-6">
                    Passez à la vitesse supérieure avec Pro
                </h1>
                <p className="text-lg text-muted mb-12 max-w-xl mx-auto">
                    Débloquez la génération illimitée de factures, sauvegardez vos données, et supprimez le filigrane {brand.name}.
                </p>

                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-brand/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-brand text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                        Populaire
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                        <div className="text-left">
                            <h2 className="text-2xl font-bold text-text mb-2">Plan Pro</h2>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-bold text-brand">9€</span>
                                <span className="text-muted">/mois</span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3 text-text">
                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    PDFs illimités
                                </li>
                                <li className="flex items-center gap-3 text-text">
                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Aucun filigrane {brand.name}
                                </li>
                                <li className="flex items-center gap-3 text-text">
                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Profil, Clients et Articles sauvegardés
                                </li>
                                <li className="flex items-center gap-3 text-text">
                                    <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Historique des factures
                                </li>
                            </ul>
                        </div>

                        <div className="w-full md:w-auto flex flex-col gap-4 min-w-[250px]">
                            {profile?.subscription_status === 'pro' ? (
                                <div className="bg-green-50 text-green-700 font-bold py-4 rounded-xl border border-green-200 text-center">
                                    Vous êtes déjà Pro !
                                </div>
                            ) : (
                                <button
                                    onClick={handleCheckout}
                                    className="w-full rounded-xl bg-brand px-8 py-4 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark hover:-translate-y-1 text-lg"
                                >
                                    S'abonner maintenant
                                </button>
                            )}
                            <p className="text-xs text-muted text-center">
                                Paiement sécurisé via Lemon Squeezy.<br />Annulable à tout moment.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;
