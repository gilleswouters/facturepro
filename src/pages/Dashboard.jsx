import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { formatEUR } from '../utils/calculations';
import { generatePDF } from '../utils/pdfGenerator';
import brand from '../config/brand';
import Papa from 'papaparse';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

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
        const data = invoice.data_snapshot || invoice.invoice_data;
        if (!data) {
            alert(t('errors.generic'));
            return;
        }

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
        const data = invoice.data_snapshot || invoice.invoice_data || {};
        const clientEmail = data.client?.email;
        if (!clientEmail) {
            alert('Veuillez ajouter une adresse email au client pour envoyer la facture.');
            return;
        }

        setActionLoadingId(invoice.id);

        try {
            // Generate the PDF as base64
            const base64Pdf = await generatePDF(
                data,
                data.totals,
                true,
                brand.name,
                brand.domain,
                data.branding?.logo_url,
                data.branding?.brand_color,
                'base64'
            );

            if (!base64Pdf) {
                throw new Error("Failed to generate PDF for email.");
            }

            // Send base64 to API
            const response = await fetch('/api/send-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: clientEmail,
                    invoiceNumber: data.details.invoiceNumber || invoice.invoice_number,
                    clientName: data.client.companyName,
                    sellerName: data.seller.companyName,
                    replyTo: data.seller.email || user.email,
                    pdfBase64: base64Pdf
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Erreur API Resend');
            }

            alert('Email envoyé avec succès !');

            // Update local state and DB to reflect email sent
            await supabase.from('invoices').update({
                last_reminder_sent_at: new Date().toISOString()
            }).eq('id', invoice.id);

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

    const exportToCSV = () => {
        const filteredInvoices = invoices.filter(inv => {
            const snap = inv.data_snapshot || inv.invoice_data || {};
            const searchMatch = !searchTerm ||
                (inv.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                (snap.client?.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
            const statusMatch = filterStatus === 'all' || inv.status === filterStatus;
            return searchMatch && statusMatch;
        });

        if (filteredInvoices.length === 0) {
            alert('Aucune facture à exporter.');
            return;
        }

        const csvData = filteredInvoices.map(inv => {
            const data = inv.data_snapshot || inv.invoice_data || {};
            const clientName = data.client?.companyName || 'Client Inconnu';
            const clientVat = data.client?.vatNumber || '';
            const subtotal = data.totals?.subtotal || 0;
            const vatTotal = data.totals?.vatTotal || 0;
            const grandTotal = data.totals?.grandTotal || 0;
            const date = new Date(inv.created_at).toLocaleDateString('fr-BE');

            let statusLabel = 'En attente';
            if (inv.status === 'paid') statusLabel = 'Payée';
            if (inv.status === 'overdue') statusLabel = 'En retard';

            return {
                'Numéro': inv.invoice_number || '-',
                'Date Emission': date,
                'Client': clientName,
                'TVA Client': clientVat,
                'Sous-total HT': subtotal.toFixed(2),
                'Total TVA': vatTotal.toFixed(2),
                'Total TTC': grandTotal.toFixed(2),
                'Statut': statusLabel,
                'Date Paiement': inv.paid_at ? new Date(inv.paid_at).toLocaleDateString('fr-BE') : ''
            };
        });

        const csv = Papa.unparse(csvData, { header: true });
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Export_Factures_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const monthlyData = Object.values(
        invoices.reduce((acc, inv) => {
            if (inv.status !== 'paid') return acc; // Only count paid invoices

            const date = new Date(inv.paid_at || inv.created_at);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('fr-BE', { month: 'short', year: 'numeric' });

            if (!acc[monthKey]) {
                acc[monthKey] = { name: monthLabel, sortKey: monthKey, total: 0 };
            }
            const snap = inv.data_snapshot || inv.invoice_data || {};
            acc[monthKey].total += (snap.totals?.grandTotal || 0);
            return acc;
        }, {})
    ).sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow bg-surface py-12">
                <div className="mx-auto max-w-[1100px] px-4 md:px-8">
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900">Mes Factures</h1>
                            <p className="mt-2 text-slate-500">Gérez et téléchargez vos factures générées.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={exportToCSV}
                                className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 shrink-0 text-center flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Exporter (CSV)
                            </button>
                            <a href="/" className="rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark shrink-0 text-center">
                                + Nouvelle Facture
                            </a>
                        </div>
                    </div>

                    {/* Revenue Stats */}
                    {monthlyData.length > 0 && (
                        <div className="mb-8 rounded-2xl border border-border bg-white shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6">Revenus (Factures payées)</h3>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: '#f1f5f9' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-slate-900 text-white text-sm rounded py-1 px-2 shadow-lg">
                                                            {formatEUR(payload[0].value)}
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 4, 4]} maxBarSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Filters & Search Bar */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-colors"
                                placeholder="Rechercher (N° facture, client...)"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="sm:w-48 shrink-0">
                            <select
                                className="block w-full py-2 pl-3 pr-10 border border-border bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition-colors"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="pending">En attente</option>
                                <option value="paid">Payée</option>
                                <option value="overdue">En retard</option>
                            </select>
                        </div>
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
                                        {invoices
                                            .filter(inv => {
                                                const snap = inv.data_snapshot || inv.invoice_data || {};
                                                const searchMatch = !searchTerm ||
                                                    (inv.invoice_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                                                    (snap.client?.companyName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

                                                const statusMatch = filterStatus === 'all' || inv.status === filterStatus;

                                                return searchMatch && statusMatch;
                                            })
                                            .map((invoice) => {
                                                const data = invoice.data_snapshot || invoice.invoice_data || {};
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
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                                invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                    'bg-amber-100 text-amber-800'
                                                                }`}>
                                                                {invoice.status === 'paid' ? 'Payée' : invoice.status === 'overdue' ? 'En retard' : 'En attente'}
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
