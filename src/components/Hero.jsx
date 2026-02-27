import React from 'react';
import { useTranslation } from 'react-i18next';
import brand from '../config/brand';

const Hero = () => {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden bg-white pt-16 pb-24 lg:pt-24 lg:pb-32">
            {/* Background decorations */}
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-light opacity-50 blur-3xl"></div>
                <div className="absolute top-48 -left-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl"></div>
            </div>

            <div className="relative z-10 mx-auto max-w-[1100px] px-6 text-center md:px-10">
                {/* Compliance Badge */}
                <div className="mx-auto mb-8 flex max-w-fit items-center gap-2 rounded-full border border-brand/20 bg-brand-light/50 px-4 py-1.5 text-xs font-semibold text-brand-dark backdrop-blur-sm sm:text-sm">
                    <span>{t('hero.badge')}</span>
                </div>

                {/* Headlines */}
                <h1 className="mx-auto max-w-4xl font-serif text-5xl leading-tight tracking-tight text-text sm:text-6xl md:text-7xl">
                    {t('hero.title')}
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
                    {t('hero.subtitle')}
                </p>

                {/* CTA Buttons */}
                <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                    <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 text-base font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-amber-600 hover:-translate-y-0.5 sm:w-auto">
                        {t('hero.cta_primary')}
                    </button>
                    <button className="flex w-full items-center justify-center rounded-xl border-2 border-border bg-white px-8 py-4 text-base font-bold text-text transition-all hover:border-text hover:bg-surface sm:w-auto">
                        {t('hero.cta_secondary')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;
