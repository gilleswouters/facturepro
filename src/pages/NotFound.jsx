import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex flex-1 flex-col items-center justify-center bg-surface px-6 py-24 text-center">
                <div className="font-mono text-9xl font-bold text-brand-light">404</div>
                <h1 className="mt-8 font-serif text-3xl font-bold text-text sm:text-4xl">
                    Page introuvable
                </h1>
                <p className="mt-4 max-w-md text-lg text-muted">
                    Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
                </p>
                <Link
                    to="/"
                    className="mt-10 rounded-xl bg-brand px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                >
                    Retour à l'accueil
                </Link>
            </main>

            <Footer />
        </div>
    );
};

export default NotFound;
