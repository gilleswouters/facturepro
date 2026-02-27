import React from 'react';
import { useTranslation } from 'react-i18next';

const NotesField = ({ notes, updateNotes }) => {
    const { t } = useTranslation();

    return (
        <div className="rounded-2xl border border-border bg-white p-6 md:p-8 mt-6">
            <h2 className="mb-4 font-serif text-xl font-bold text-text">
                {t('invoice.notes_section')}
            </h2>
            <textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand transition-colors text-muted leading-relaxed"
            />
        </div>
    );
};

export default NotesField;
