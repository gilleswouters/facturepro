import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const AuthModal = () => {
    const { t } = useTranslation();
    const { authModalOpen, closeAuthModal, authMode, setAuthMode, signIn, signUp } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!authModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let result;
            if (authMode === 'signin') {
                result = await signIn(email, password);
            } else {
                result = await signUp(email, password);
            }

            if (result.error) {
                setError(result.error.message || t('auth.error_generic'));
            }
        } catch (err) {
            setError(t('auth.error_generic'));
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
        setError('');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-serif font-bold text-center mb-6">
                        {authMode === 'signin' ? t('auth.signin_title') : t('auth.signup_title')}
                    </h2>

                    {error && (
                        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('auth.email')}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-text uppercase tracking-wider">{t('auth.password')}</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full mt-2 rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-brand-dark ${loading ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                        >
                            {loading ? t('auth.loading') : (authMode === 'signin' ? t('auth.signin_action') : t('auth.signup_action'))}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={toggleMode}
                            className="text-sm text-muted hover:text-brand font-medium underline underline-offset-2 transition-colors"
                        >
                            {authMode === 'signin' ? t('auth.switch_to_signup') : t('auth.switch_to_signin')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
