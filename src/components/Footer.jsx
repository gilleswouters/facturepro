import React from 'react';
import { useTranslation } from 'react-i18next';
import brand from '../config/brand';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full border-t border-border bg-white py-12 text-center text-sm text-muted">
            <div className="mx-auto max-w-[1100px] px-6">
                <div className="mb-4 font-serif text-lg font-bold text-text">
                    {brand.name}
                </div>
                <p>
                    &copy; {new Date().getFullYear()} {brand.name}. {t('footer.rights')}
                </p>
            </div>
        </footer>
    );
};

export default Footer;
