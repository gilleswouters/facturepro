import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Products = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        description: '',
        default_price: '',
        default_vat_rate: '21'
    });

    useEffect(() => {
        fetchProducts();
    }, [user]);

    const fetchProducts = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('profile_id', user.id)
                .order('description', { ascending: true });

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
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
                .from('products')
                .insert([{
                    profile_id: user.id,
                    description: formData.description,
                    default_price: parseFloat(formData.default_price) || 0,
                    vat_rate: parseFloat(formData.default_vat_rate) || 21
                }]);

            if (error) throw error;

            // Reset and refetch
            setFormData({ description: '', default_price: '', default_vat_rate: '21' });
            setIsAdding(false);
            fetchProducts();

        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Voulez-vous vraiment supprimer cet article ?')) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-grow bg-surface py-12">
                <div className="mx-auto max-w-[1100px] px-4 md:px-8">

                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-slate-900">Mes Articles & Prestations</h1>
                            <p className="mt-2 text-slate-500">Sauvegardez vos services et produits fréquents.</p>
                        </div>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="rounded-xl bg-brand px-6 py-3 font-bold text-white shadow-lg shadow-brand/20 transition-all hover:-translate-y-0.5 hover:bg-brand-dark"
                        >
                            {isAdding ? 'Annuler' : '+ Nouvel Article'}
                        </button>
                    </div>

                    {isAdding && (
                        <div className="mb-8 rounded-2xl border border-border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-xl font-bold">Ajouter un article</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Description</label>
                                        <input required type="text" name="description" value={formData.description} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Prix Unitaire (€ HTVA)</label>
                                        <input required type="number" step="0.01" name="default_price" value={formData.default_price} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-slate-700">Taux TVA (%)</label>
                                        <select name="default_vat_rate" value={formData.default_vat_rate} onChange={handleChange} className="w-full rounded-lg border border-border px-4 py-2 focus:border-brand focus:outline-none bg-white">
                                            <option value="21">21%</option>
                                            <option value="6">6%</option>
                                            <option value="12">12%</option>
                                            <option value="0">0%</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button type="submit" className="rounded-lg bg-slate-900 px-6 py-2 font-bold text-white transition-colors hover:bg-slate-800">
                                        Enregistrer l'article
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500">Chargement...</div>
                        ) : products.length === 0 ? (
                            <div className="p-16 text-center text-slate-500">
                                Vous n'avez pas encore ajouté d'article ou de prestation.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-border text-slate-500">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider">Description</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Prix HTVA</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">TVA</th>
                                            <th className="px-6 py-4 font-semibold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 font-medium">{product.description}</td>
                                                <td className="px-6 py-4 text-slate-600 text-right">{product.default_price.toFixed(2)} €</td>
                                                <td className="px-6 py-4 text-slate-600 text-right">{product.vat_rate}%</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-medium">
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

export default Products;
