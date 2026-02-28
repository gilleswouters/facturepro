import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { calcLineTotal, formatEUR } from '../../utils/calculations';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const LineItems = ({ lines, updateLineItem, addLineItem, removeLineItem }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);

    // Fetch saved products if logged in
    useEffect(() => {
        const fetchProducts = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('profile_id', user.id)
                    .order('description', { ascending: true });

                if (!error && data) {
                    setProducts(data);
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };

        fetchProducts();
    }, [user]);

    const handleLineChange = (id, field, value) => {
        // Parse numeric fields appropriately
        let finalValue = value;
        if (field === 'vatRate') {
            finalValue = parseFloat(value) || 0;
        } else if (field === 'qty' || field === 'unitPrice') {
            // Keep as string to allow users to type a comma or dot freely
            finalValue = value;
        }
        updateLineItem(id, field, finalValue);
    };

    const handleProductSelect = (id, productId) => {
        if (!productId) return;
        const selectedProduct = products.find(p => p.id === productId);
        if (selectedProduct) {
            updateLineItem(id, 'description', selectedProduct.description);
            updateLineItem(id, 'unitPrice', selectedProduct.default_price);
            updateLineItem(id, 'vatRate', selectedProduct.default_vat_rate);
        }
    };

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 mt-6">
            <h2 className="mb-6 font-serif text-2xl font-bold text-text">
                {t('invoice.items')}
            </h2>

            {/* Desktop Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 mb-2 text-xs font-bold text-muted uppercase tracking-wider px-2">
                <div className="col-span-4">{t('invoice.description')}</div>
                <div className="col-span-2">{t('invoice.qty')}</div>
                <div className="col-span-2">{t('invoice.unit_price')}</div>
                <div className="col-span-2">{t('invoice.vat_rate')}</div>
                <div className="col-span-2 text-right">Total</div>
            </div>

            <div className="space-y-4">
                {lines.map((line, index) => (
                    <div key={line.id} className="relative rounded-xl border border-border bg-surface p-4 md:p-2 md:bg-transparent md:border-none md:grid md:grid-cols-12 md:gap-4 md:items-center">

                        {/* Mobile labels shown, hidden on desktop */}

                        {/* Description */}
                        <div className="col-span-4 mb-3 md:mb-0 space-y-1">
                            <label className="text-xs font-semibold text-text uppercase md:hidden">{t('invoice.description')}</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={line.description}
                                    onChange={(e) => handleLineChange(line.id, 'description', e.target.value)}
                                    className="w-full rounded-lg border border-border bg-white md:bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                                    placeholder="Ex: Prestation web"
                                />
                                {user && products.length > 0 && (
                                    <div className="relative">
                                        <select
                                            onChange={(e) => handleProductSelect(line.id, e.target.value)}
                                            className="w-8 h-full opacity-0 absolute top-0 right-0 cursor-pointer z-10"
                                            defaultValue=""
                                            title="Choisir un article enregistré"
                                        >
                                            <option value="" disabled>Choisir...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.description}</option>
                                            ))}
                                        </select>
                                        <div className="h-full flex items-center justify-center bg-slate-100 border border-border rounded-lg px-2 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Qty */}
                        <div className="col-span-2 mb-3 md:mb-0 space-y-1">
                            <label className="text-xs font-semibold text-text uppercase md:hidden">{t('invoice.qty')}</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={line.qty}
                                onChange={(e) => handleLineChange(line.id, 'qty', e.target.value)}
                                className="w-full rounded-lg border border-border bg-white md:bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                            />
                        </div>

                        {/* Unit Price */}
                        <div className="col-span-2 mb-3 md:mb-0 space-y-1">
                            <label className="text-xs font-semibold text-text uppercase md:hidden">{t('invoice.unit_price')}</label>
                            <input
                                type="text"
                                inputMode="decimal"
                                value={line.unitPrice}
                                onChange={(e) => handleLineChange(line.id, 'unitPrice', e.target.value)}
                                className="w-full rounded-lg border border-border bg-white md:bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                            />
                        </div>

                        {/* VAT Rate */}
                        <div className="col-span-2 mb-3 md:mb-0 space-y-1">
                            <label className="text-xs font-semibold text-text uppercase md:hidden">{t('invoice.vat_rate')}</label>
                            <select
                                value={line.vatRate}
                                onChange={(e) => handleLineChange(line.id, 'vatRate', e.target.value)}
                                className="w-full rounded-lg border border-border bg-white md:bg-surface px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors"
                            >
                                <option value={21}>21%</option>
                                <option value={12}>12%</option>
                                <option value={6}>6%</option>
                                <option value={0}>0%</option>
                            </select>
                        </div>

                        {/* Line Total */}
                        <div className="col-span-2 flex items-center justify-between md:justify-end">
                            <span className="text-xs font-semibold text-text uppercase md:hidden">Total HT</span>
                            <span className="font-mono text-sm font-bold text-text">
                                {formatEUR(calcLineTotal(line.qty, line.unitPrice))}
                            </span>
                        </div>

                        {/* Delete button */}
                        {lines.length > 1 && (
                            <button
                                onClick={() => removeLineItem(line.id)}
                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-muted hover:bg-red-100 hover:text-red-500 transition-colors md:static md:-mb-0 md:ml-2"
                                title="Remove item"
                            >
                                ×
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={addLineItem}
                className="mt-6 flex items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-sm font-semibold text-brand hover:border-brand hover:bg-brand-light/20 transition-all w-full md:w-auto"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {t('invoice.add_item')}
            </button>
        </div>
    );
};

export default LineItems;
