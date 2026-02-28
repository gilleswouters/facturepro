import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatEUR } from '../utils/calculations';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-brand font-medium hover:underline">
                                                            Télécharger
                                                        </button>
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
