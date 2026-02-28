import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useInvoice from '../../hooks/useInvoice';
import usePDF from '../../hooks/usePDF';
import { useAuth } from '../../contexts/AuthContext';

import SellerForm from './SellerForm';
import ClientForm from './ClientForm';
import InvoiceDetails from './InvoiceDetails';
import LineItems from './LineItems';
import Totals from './Totals';
import NotesField from './NotesField';
import PDFPreview from './PDFPreview';

const InvoiceBuilder = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, profile, openAuthModal } = useAuth();

    const {
        invoiceData,
        totals,
        updateSection,
        updateNotes,
        addLineItem,
        updateLineItem,
        removeLineItem
    } = useInvoice(profile);

    const { downloadPDF, isGenerating, error, remainingFree, isLimitReached } = usePDF();

    const isPro = profile?.subscription_status === 'pro' || profile?.subscription_status === 'business';

    const handleSellerChange = useCallback((data) => updateSection('seller', data), [updateSection]);
    const handleClientChange = useCallback((data) => updateSection('client', data), [updateSection]);
    const handleDetailsChange = useCallback((data) => updateSection('details', data), [updateSection]);

    const handleDownload = () => {
        downloadPDF(invoiceData, totals, isPro);
    };

    return (
        <div className="bg-surface py-12 md:py-16 selection:bg-brand-light selection:text-brand-dark">
            <div className="mx-auto max-w-[1300px] px-4 md:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 relative">

                    {/* Left Column: Form Builder (7 cols) */}
                    <div className="lg:col-span-7 space-y-6">
                        <SellerForm
                            defaultValues={invoiceData.seller}
                            onChange={handleSellerChange}
                        />

                        <ClientForm
                            defaultValues={invoiceData.client}
                            onChange={handleClientChange}
                        />

                        <InvoiceDetails
                            defaultValues={invoiceData.details}
                            onChange={handleDetailsChange}
                        />

                        <LineItems
                            lines={invoiceData.lines}
                            updateLineItem={updateLineItem}
                            addLineItem={addLineItem}
                            removeLineItem={removeLineItem}
                        />

                        <Totals totals={totals} />

                        <NotesField notes={invoiceData.notes} updateNotes={updateNotes} />

                        {/* Download Action Bar (Mobile + Bottom Desktop) */}
                        <div className="sticky bottom-6 z-40 mt-10 rounded-2xl bg-white border-2 border-brand p-4 shadow-xl flex items-center justify-between">
                            <div>
                                <div className="font-bold text-lg text-text">{formatEUR(totals.grandTotal)}</div>

                                {isPro ? (
                                    <div className="text-xs text-brand font-medium">Pro · Pas de filigrane</div>
                                ) : (
                                    <div className="text-xs text-muted">
                                        {t('pricing.free')} · {t('builder.pdfs_remaining', { count: remainingFree })}
                                    </div>
                                )}
                            </div>

                            {(!isPro && isLimitReached) ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => user ? navigate('/subscription') : openAuthModal('signup')}
                                        className="hidden sm:block rounded-xl bg-orange-500 px-6 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 hover:-translate-y-0.5"
                                    >
                                        {t('builder.upgrade_cta')}
                                    </button>
                                    <button
                                        disabled={true}
                                        className="rounded-xl bg-slate-200 px-6 py-3 font-bold text-slate-500 cursor-not-allowed flex items-center gap-2"
                                        title="Limite de 5 PDF atteinte"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                        <span className="hidden sm:inline">{t('builder.download_pdf')}</span>
                                        <span className="sm:hidden">PDF</span>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleDownload}
                                    disabled={isGenerating}
                                    className={`rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 flex items-center gap-2 ${isGenerating ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
                                >
                                    {isGenerating ? (
                                        <svg className="animate-spin h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="hidden sm:inline">{t('builder.download_pdf')}</span>
                                    <span className="sm:hidden">PDF</span>
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-200 font-medium">
                                {error}
                            </div>
                        )}

                    </div>

                    {/* Right Column: Live PDF Preview (5 cols, sticky) */}
                    <div className="lg:col-span-5 hidden lg:block relative">
                        <PDFPreview invoiceData={invoiceData} totals={totals} isPro={isPro} />
                    </div>

                </div>
            </div>
        </div>
    );
};

// Extracted inside component for isolation, but would use utility normally
const formatEUR = (amount) => {
    const formatted = amount.toLocaleString('fr-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatted.replace(/[\u202F\u00A0]/g, ' ') + ' €';
};

export default InvoiceBuilder;
