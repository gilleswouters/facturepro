import React from 'react';
import { useTranslation } from 'react-i18next';

const Pricing = () => {
    const { t } = useTranslation();

    return (
        <div className="bg-white py-24">
            <div className="mx-auto max-w-[1100px] px-6 md:px-10">
                <h2 className="mb-16 text-center font-serif text-4xl font-bold text-text md:text-5xl">
                    {t('pricing.title')}
                </h2>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {/* Free Tier */}
                    <div className="flex flex-col rounded-3xl border border-border bg-surface p-8 shadow-sm">
                        <h3 className="font-serif text-2xl font-bold text-text">{t('pricing.free')}</h3>
                        <p className="mt-2 text-sm text-muted">{t('pricing.free_desc')}</p>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-text">0€</span>
                            <span className="text-muted">/mois</span>
                        </div>
                        <ul className="mb-8 flex-1 space-y-4 text-sm text-text">
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> 5 factures / mois
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> PDF avec filigrane
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Sans compte
                            </li>
                        </ul>
                        <button className="w-full rounded-xl bg-white border-2 border-border py-4 font-bold text-text hover:bg-slate-50 transition-colors">
                            Créer une facture
                        </button>
                    </div>

                    {/* Pro Tier (Highlighted) */}
                    <div className="relative flex flex-col rounded-3xl border-2 border-brand bg-white p-8 shadow-xl">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-brand px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                            {t('pricing.coming_soon')}
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-brand">{t('pricing.pro')}</h3>
                        <p className="mt-2 text-sm text-muted">{t('pricing.pro_desc')}</p>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-text">9€</span>
                            <span className="text-muted">/mois</span>
                        </div>
                        <ul className="mb-8 flex-1 space-y-4 text-sm text-text">
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Factures illimitées
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Sans filigrane
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Sauvegarde clients/produits
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Numérotation automatique
                            </li>
                        </ul>
                        <button disabled className="w-full rounded-xl bg-brand py-4 font-bold text-white opacity-80 cursor-not-allowed">
                            {t('hero.cta_secondary')}
                        </button>
                    </div>

                    {/* Business Tier */}
                    <div className="relative flex flex-col rounded-3xl border border-border bg-white p-8 shadow-sm">
                        <div className="absolute -top-4 right-8 rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-muted uppercase">
                            Phase 3
                        </div>
                        <h3 className="font-serif text-2xl font-bold text-text">{t('pricing.business')}</h3>
                        <p className="mt-2 text-sm text-muted">{t('pricing.business_desc')}</p>
                        <div className="my-6">
                            <span className="text-4xl font-bold text-text">29€</span>
                            <span className="text-muted">/mois</span>
                        </div>
                        <ul className="mb-8 flex-1 space-y-4 text-sm text-text">
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Tout du plan Pro
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Multi-utilisateurs
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-success">✓</span> Génération CSV/Batch
                            </li>
                        </ul>
                        <button disabled className="w-full rounded-xl bg-white border-2 border-border py-4 font-bold text-text opacity-80 cursor-not-allowed">
                            {t('pricing.coming_soon')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
