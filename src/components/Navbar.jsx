import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import brand from '../config/brand';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const { user, profile, openAuthModal, signOut } = useAuth();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'fr' ? 'nl' : 'fr');
    };

    return (
        <div className="w-full">
            {/* Target Audience Banner */}
            <div className="w-full bg-brand-dark px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
                <span className="opacity-90">
                    {brand.crosslinkMessage}
                    <a
                        href={brand.crosslinkUrl}
                        className="underline underline-offset-2 hover:text-brand-light transition-colors font-bold"
                    >
                        {brand.crosslinkName}
                    </a>
                </span>
            </div>

            {/* Main Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-6 md:px-10">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white font-serif text-xl font-bold">
                            {brand.name.charAt(0)}
                        </div>
                        <span className="font-serif text-xl font-bold tracking-tight text-text">
                            {brand.name}
                        </span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden items-center gap-6 md:flex">
                        {/* Language Switcher */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 text-sm font-medium text-muted hover:text-brand transition-colors"
                        >
                            <span className={i18n.language === 'fr' ? 'text-brand font-bold' : ''}>FR</span>
                            <span className="text-border">/</span>
                            <span className={i18n.language === 'nl' ? 'text-brand font-bold' : ''}>NL</span>
                        </button>

                        {/* Auth Buttons */}
                        <div className="h-4 w-px bg-border"></div>

                        {user ? (
                            <div className="relative group p-2 -m-2">
                                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-text hover:text-brand transition-colors">
                                    <div className="h-8 w-8 rounded-full bg-brand-light text-brand flex items-center justify-center font-bold">
                                        {profile?.company_name ? profile.company_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="hidden lg:block truncate max-w-[120px]">
                                        {profile?.company_name || user.email.split('@')[0]}
                                    </span>
                                </Link>

                                <div className="absolute right-0 top-full mt-0 pt-2 hidden w-48 flex-col group-hover:flex z-50">
                                    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-lg">
                                        <Link to="/dashboard" className="px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface transition-colors">
                                            {t('nav.dashboard')}
                                        </Link>
                                        <div className="h-px w-full bg-border"></div>
                                        <Link to="/clients" className="px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface transition-colors">
                                            {t('nav.clients')}
                                        </Link>
                                        <Link to="/products" className="px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface transition-colors">
                                            {t('nav.products')}
                                        </Link>
                                        <div className="h-px w-full bg-border"></div>
                                        <Link to="/profile" className="px-4 py-3 text-left text-sm font-medium text-text hover:bg-surface transition-colors">
                                            {t('nav.profile')}
                                        </Link>
                                        <div className="h-px w-full bg-border"></div>
                                        <Link to="/subscription" className="px-4 py-3 text-left text-sm font-medium text-brand hover:bg-brand/10 transition-colors flex items-center justify-between">
                                            <span>{profile?.subscription_status === 'pro' ? t('nav.pro_subscription') : t('nav.upgrade_pro')}</span>
                                            {profile?.subscription_status !== 'pro' && (
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] text-white">!</span>
                                            )}
                                        </Link>
                                        <div className="h-px w-full bg-border"></div>
                                        <button onClick={signOut} className="px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button onClick={() => openAuthModal('signin')} className="text-sm font-medium text-text hover:text-brand transition-colors">
                                    {t('nav.login')}
                                </button>
                                <button onClick={() => openAuthModal('signup')} className="rounded-lg bg-text px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                                    {t('nav.register')}
                                </button>
                            </>
                        )}
                    </div>

                    {/* Mobile Nav Toggle (Simplified for Phase 1/2) */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-muted"
                        >
                            {i18n.language === 'fr' ? 'FR' : 'NL'}
                        </button>

                        {user ? (
                            <button onClick={signOut} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition-colors">
                                Exit
                            </button>
                        ) : (
                            <button onClick={() => openAuthModal('signin')} className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors">
                                {t('nav.login')}
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
