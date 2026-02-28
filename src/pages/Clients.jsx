import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Clients = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        company_name: '',
        address: '',
        vat_number: '',
        email: ''
    });

    useEffect(() => {
        fetchClients();
    }, [user]);

    const fetchClients = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('clients')
                .select('*')
                .eq('profile_id', user.id)
                .order('company_name', { ascending: true });

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const { error } = await supabase
                .from('clients')
                .insert([{
                    profile_id: user.id,
                    ...formData
                }]);

            if (error) throw error;

            // Reset and refetch
            setFormData({ company_name: '', address: '', vat_number: '', email: '' });
            setIsAdding(false);
            fetchClients();

        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save client.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer ce client ?')) return;

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow bg-surface py-12">
                <div className="mx-auto max-w-[1100px] px-4 md:px-8">

                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900">Mes Clients</h1>
                            <p className="mt-2 text-slate-500">Gérez votre carnet d'adresses pour accélérer la facturation.</p>
                        </div>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                        >
                            {isAdding ? 'Annuler' : '+ Nouveau Client'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-bold">Ajouter un client</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Nom de la société</label>
                                        <input required type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Numéro de TVA</label>
                                        <input type="text" name="vat_number" value={formData.vat_number} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 uppercase focus:border-brand focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Email (optionnel)</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Adresse complète</label>
                                        <textarea name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="rounded-lg bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800">
                                        Enregistrer le client
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">Chargement...</div>
                        ) : clients.length === 0 ? (
                            <div className="p-16 text-center text-slate-500">
                                Vous n'avez pas encore ajouté de client.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-border text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Société</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">TVA</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {clients.map((client) => (
                                            <tr key={client.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium">{client.company_name}</td>
                                                <td className="px-6 py-4 text-slate-600">{client.vat_number || '-'}</td>
                                                <td className="px-6 py-4 text-slate-600">{client.email || '-'}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDelete(client.id)} className="text-red-500 hover:text-red-700 font-medium">
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
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

export default Clients;
