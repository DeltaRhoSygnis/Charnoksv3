
import React, { useState, useMemo } from 'react';
import { mockNotes } from '../data/mockData';
import type { Note } from '../types';
import Spinner from '../components/ui/Spinner';

type NoteCategory = Note['category'] | 'All';

const NotesPage: React.FC = () => {
    const [notes, setNotes] = useState<Note[]>(mockNotes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form state
    const [category, setCategory] = useState<Note['category']>('Other');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');

    // Filter state
    const [categoryFilter, setCategoryFilter] = useState<NoteCategory>('All');

    const showAmountField = useMemo(() => category === 'Supply Cost' || category === 'Internal Expense', [category]);

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const newNote: Note = {
            id: `note-${Date.now()}`,
            date: new Date().toISOString(),
            category,
            title,
            description,
            amount: showAmountField ? parseFloat(amount) : undefined,
        };

        // Simulate API call
        setTimeout(() => {
            setNotes(prev => [newNote, ...prev]);
            // Reset form
            setTitle('');
            setDescription('');
            setAmount('');
            setCategory('Other');
            setIsSubmitting(false);
        }, 1000);
    };
    
    const filteredNotes = useMemo(() => {
        return notes.filter(note => {
            if (categoryFilter === 'All') return true;
            return note.category === categoryFilter;
        });
    }, [notes, categoryFilter]);
    
    const noteCategories: Note['category'][] = ['Delivery Note', 'Reminder', 'Supply Cost', 'Internal Expense', 'Other'];

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">Internal Log</h1>
                <p className="text-text-secondary mt-1">Record internal notes, memos, and expenses.</p>
            </header>

            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <h2 className="text-2xl font-bold mb-4 text-text-primary">Add New Note</h2>
                <form onSubmit={handleAddNote} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                             <select value={category} onChange={e => setCategory(e.target.value as Note['category'])} className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition text-text-primary">
                                {noteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Note Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={4} className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition"></textarea>
                    </div>
                    {showAmountField && (
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Amount ($)</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button type="submit" disabled={isSubmitting} className="px-6 py-3 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80 disabled:opacity-50 flex items-center justify-center">
                             {isSubmitting && <Spinner size="sm" />}
                            <span className={isSubmitting ? 'ml-2' : ''}>Save Note</span>
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <h2 className="text-2xl font-bold">Recent Notes ({filteredNotes.length})</h2>
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-text-secondary">Filter by Category:</label>
                         <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as NoteCategory)} className="bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition text-text-primary">
                            <option value="All">All Categories</option>
                            {noteCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-left table-auto">
                        <thead className="sticky top-0 bg-card-bg-solid/80 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary">Date</th>
                                <th className="p-3 font-semibold text-text-secondary">Category</th>
                                <th className="p-3 font-semibold text-text-secondary">Title</th>
                                <th className="p-3 font-semibold text-text-secondary text-right">Amount</th>
                                <th className="p-3 font-semibold text-text-secondary text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotes.map(note => (
                                <tr key={note.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                                    <td className="p-3 whitespace-nowrap">{new Date(note.date).toLocaleDateString()}</td>
                                    <td className="p-3 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-semibold bg-primary/20 text-primary rounded-full">{note.category}</span>
                                    </td>
                                    <td className="p-3 font-medium text-text-primary">{note.title}</td>
                                    <td className="p-3 text-right font-semibold text-accent whitespace-nowrap">
                                        {note.amount ? `$${note.amount.toFixed(2)}` : 'N/A'}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button className="text-sm text-text-secondary hover:text-text-primary">View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;
