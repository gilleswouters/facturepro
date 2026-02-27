import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import brand from '../config/brand';

const Navbar = () => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'fr' ? 'nl' : 'fr');
    };

    return (
        <div className="w-full">
            {/* Target Audience Banner */}
            <div className="w-full bg-brand-dark px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
                <span className="opacity-90">
                    Vous êtes en Flandre ? Ga naar{' '}
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
                        <button className="text-sm font-medium text-text hover:text-brand transition-colors">
                            {t('nav.login')}
                        </button>
                        <button className="rounded-lg bg-text px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                            {t('nav.register')}
                        </button>
                    </div>

                    {/* Mobile Nav Toggle (Simplified for Phase 1) */}
                    <div className="flex items-center gap-4 md:hidden">
                        <button
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-muted"
                        >
                            {i18n.language === 'fr' ? 'FR' : 'NL'}
                        </button>
                        <button className="rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white transition-colors">
                            {t('nav.login')}
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
