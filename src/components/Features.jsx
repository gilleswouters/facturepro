import React from 'react';
import { useTranslation } from 'react-i18next';
import brand from '../config/brand';

const Features = () => {
    const { t } = useTranslation();

    const features = [
        {
            id: 'item1',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            id: 'item2',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'item3',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            id: 'item4',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        }
    ];

    return (
        <div className="bg-surface py-20 lg:py-24">
            <div className="mx-auto max-w-[1100px] px-6 md:px-10">
                <h2 className="mb-12 text-center font-serif text-3xl font-bold text-text sm:text-4xl">
                    {t('features.title', { brand: brand.name })}
                </h2>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature) => (
                        <div
                            key={feature.id}
                            className="group flex flex-col items-center rounded-2xl bg-white p-8 text-center border border-border transition-all hover:border-brand-light hover:shadow-lg"
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-light transition-transform group-hover:scale-110">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold text-text">
                                {t(`features.${feature.id}`)}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
