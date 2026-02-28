import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatEUR } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import brand from '../config/brand';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('invoices')
                    .select('*')
                    .eq('profile_id', user.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;

                setInvoices(data || []);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, [user]);

    const handleDownload = (invoice) => {
        if (!invoice.invoice_data) {
            alert(t('errors.generic'));
            return;
        }

        const data = invoice.invoice_data;
        // Re-generate the PDF using the exact historical snapshot
        generatePDF(
            data,
            data.totals,
            true, // Always true for saved invoices since only Pro can save them
            brand.name,
            brand.domain,
            data.branding?.logo_url,
            data.branding?.brand_color
        );
    };

    const handleSendEmail = async (invoice) => {
        const clientEmail = invoice.invoice_data?.client?.email;
        if (!clientEmail) {
            alert('Veuillez ajouter une adresse email au client pour envoyer la facture.');
            return;
        }

        setActionLoadingId(invoice.id);

        try {
            const data = invoice.invoice_data;
            const doc = new (await import('jspdf')).default({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            // We need to pass the doc instance into a modified generatePDF, OR generatePDF needs to return the doc or base64. 
            // For now, let's use a trick: the existing generatePDF calls doc.save().
            // Let's refactor generatePDF to accept a returnType parameter. 
            alert('L\'envoi d\'email sera finalisé après l\'adaptation du générateur PDF pour le format Base64.');

        } catch (error) {
            console.error('Error sending email:', error);
            alert('Erreur lors de l\'envoi de l\'email.');
        } finally {
            setActionLoadingId(null);
        }
    };

    const togglePaymentStatus = async (invoice) => {
        const isCurrentlyPaid = invoice.status === 'paid';
        const newStatus = isCurrentlyPaid ? 'pending' : 'paid';
        const paidAt = isCurrentlyPaid ? null : new Date().toISOString();

        setActionLoadingId(invoice.id);

        try {
            const { error } = await supabase
                .from('invoices')
                .update({ status: newStatus, paid_at: paidAt })
                .eq('id', invoice.id);

            if (error) throw error;

            setInvoices(prev => prev.map(inv =>
                inv.id === invoice.id
                    ? { ...inv, status: newStatus, paid_at: paidAt }
                    : inv
            ));

        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur lors de la mise à jour du statut.');
        } finally {
            setActionLoadingId(null);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow bg-surface py-12">
                <div className="mx-auto max-w-[1100px] px-4 md:px-8">
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900">Mes Factures</h1>
                            <p className="mt-2 text-slate-500">Gérez et téléchargez vos factures générées.</p>
                        </div>
                        <a href="/" className="rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark">
                            + Nouvelle Facture
                        </a>
                    </div>

                    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent mb-4"></div>
                                <p>Chargement de vos factures...</p>
                            </div>
                        ) : invoices.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900">Aucune facture pour le moment</h3>
                                <p className="mb-6 text-slate-500">Vous n'avez pas encore généré de facture sur ce compte.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-border text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">N° Facture</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Client</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Montant</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-center">Statut</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {invoices.map((invoice) => {
                                            const data = invoice.invoice_data || {};
                                            const clientName = data.client?.companyName || 'Client inconnu';
                                            const total = data.totals?.grandTotal || 0;
                                            const date = new Date(invoice.created_at).toLocaleDateString('fr-BE');

                                            return (
                                                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">{invoice.invoice_number || '-'}</td>
                                                    <td className="px-6 py-4 text-slate-600">{clientName}</td>
                                                    <td className="px-6 py-4 text-slate-600">{date}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-slate-900">{formatEUR(total)}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                            {invoice.status === 'paid' ? 'Payée' : 'En attente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right space-x-3">
                                                        {actionLoadingId === invoice.id ? (
                                                            <span className="text-sm text-slate-400">En cours...</span>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={() => handleSendEmail(invoice)}
                                                                    className="text-brand font-medium hover:underline text-sm"
                                                                    title="Envoyer par email"
                                                                >
                                                                    Envoyer
                                                                </button>
                                                                <button
                                                                    onClick={() => togglePaymentStatus(invoice)}
                                                                    className={`${invoice.status === 'paid' ? 'text-slate-500' : 'text-green-600'} font-medium hover:underline text-sm`}
                                                                    title={invoice.status === 'paid' ? 'Marquer comme non payée' : 'Marquer comme payée'}
                                                                >
                                                                    {invoice.status === 'paid' ? 'Annuler' : 'Payée'}
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDownload(invoice)}
                                                                    className="text-slate-600 font-medium hover:text-brand transition-colors"
                                                                    title="Télécharger le PDF"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                    </svg>
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
