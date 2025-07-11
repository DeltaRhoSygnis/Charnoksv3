
import React, { useState, useMemo } from 'react';
import { mockSales, mockWorkers, mockProducts } from '../data/mockData';
import type { Sale } from '../types';

const TransactionRow: React.FC<{ sale: Sale }> = ({ sale }) => {
    const [isOpen, setIsOpen] = useState(false);
    const workerName = mockWorkers.find(w => w.id === sale.workerId)?.name || 'Unknown';

    return (
        <>
            <tr onClick={() => setIsOpen(!isOpen)} className="border-b border-border/50 hover:bg-white/5 transition-colors cursor-pointer">
                <td className="p-3 whitespace-nowrap">{new Date(sale.date).toLocaleString()}</td>
                <td className="p-3 whitespace-nowrap">{workerName}</td>
                <td className="p-3 text-center">{sale.items.length}</td>
                <td className="p-3 text-right font-semibold text-green-400 whitespace-nowrap">{`$${sale.total.toFixed(2)}`}</td>
                <td className="p-3 text-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-5 w-5 mx-auto transition-transform duration-300 text-text-secondary ${isOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </td>
            </tr>
            {isOpen && (
                <tr className="bg-black/20">
                    <td colSpan={5} className="p-4 border-b border-border/50">
                        <div className="space-y-2 max-w-md mx-auto">
                             <h4 className="font-bold text-text-primary">Sale Items:</h4>
                             {sale.items.map((item, index) => {
                                 const productName = mockProducts.find(p => p.id === item.productId)?.name || 'Unknown Product';
                                 return (
                                     <div key={index} className="flex justify-between text-text-secondary text-sm ml-4">
                                         <span>{productName} &times; {item.quantity}</span>
                                         <span>${(item.price * item.quantity).toFixed(2)}</span>
                                     </div>
                                 );
                             })}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};


const TransactionsPage: React.FC = () => {
    const [workerFilter, setWorkerFilter] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<string>('all');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    
    const TRANSACTIONS_PER_PAGE = 15;
    type DateFilter = 'all' | 'today' | '7d' | '30d';

    const dateFilters: { id: DateFilter, label: string }[] = [
        { id: 'all', label: 'All Time' },
        { id: 'today', label: 'Today' },
        { id: '7d', label: 'Last 7 Days' },
        { id: '30d', label: 'Last 30 Days' },
    ];

    const filteredSales = useMemo(() => {
        let sales = mockSales;

        // Worker filter
        if (workerFilter !== 'all') {
            sales = sales.filter(sale => sale.workerId === workerFilter);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            let startDate = new Date();
            if (dateFilter === 'today') {
                startDate.setHours(0, 0, 0, 0);
            } else if (dateFilter === '7d') {
                startDate.setDate(now.getDate() - 7);
            } else if (dateFilter === '30d') {
                startDate.setDate(now.getDate() - 30);
            }
            sales = sales.filter(sale => new Date(sale.date) >= startDate && new Date(sale.date) <= now);
        }
        
        return sales;
    }, [workerFilter, dateFilter]);
    
    const sortedSales = useMemo(() => {
        return [...filteredSales].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });
    }, [filteredSales, sortOrder]);

    const paginatedSales = useMemo(() => {
        const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
        return sortedSales.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE);
    }, [sortedSales, currentPage]);

    const totalPages = Math.ceil(sortedSales.length / TRANSACTIONS_PER_PAGE);

    const handleSort = () => {
        setSortOrder(prev => (prev === 'desc' ? 'asc' : 'desc'));
    };

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">Transaction History</h1>
                <p className="text-text-secondary mt-1">Browse, filter, and sort all past sales.</p>
            </header>

            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="worker-filter" className="block text-sm font-medium text-text-secondary mb-1">Filter by Worker</label>
                            <select id="worker-filter" value={workerFilter} onChange={e => { setWorkerFilter(e.target.value); setCurrentPage(1); }} className="w-full max-w-xs bg-transparent border-2 border-border/50 rounded-lg p-2 focus:border-primary focus:ring-0 transition text-text-primary">
                                <option value="all">All Workers</option>
                                {mockWorkers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Filter by Date</label>
                            <div className="flex items-center bg-black/20 p-1 rounded-lg">
                                {dateFilters.map(range => (
                                    <button key={range.id} onClick={() => { setDateFilter(range.id); setCurrentPage(1); }} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${dateFilter === range.id ? 'bg-primary text-text-on-primary' : 'text-text-secondary hover:bg-white/10'}`}>
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                         <h2 className="text-2xl font-bold">Total Sales Found</h2>
                         <p className="text-3xl font-bold text-primary">{sortedSales.length}</p>
                    </div>
                </div>
                 <div className="overflow-auto max-h-[60vh]">
                    <table className="w-full text-left table-auto">
                        <thead className="sticky top-0 bg-card-bg-solid/80 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary">
                                    <button onClick={handleSort} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                                        Date & Time
                                        {sortOrder === 'desc' ? '▼' : '▲'}
                                    </button>
                                </th>
                                <th className="p-3 font-semibold text-text-secondary">Worker</th>
                                <th className="p-3 font-semibold text-text-secondary text-center">Items</th>
                                <th className="p-3 font-semibold text-text-secondary text-right">Total</th>
                                <th className="p-3 font-semibold text-text-secondary text-center w-20">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                           {paginatedSales.map(sale => (
                               <TransactionRow key={sale.id} sale={sale} />
                           ))}
                        </tbody>
                    </table>
                     {paginatedSales.length === 0 && (
                        <div className="text-center py-10 text-text-secondary">
                            <p>No transactions found for the selected filters.</p>
                        </div>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-white/10 rounded-lg text-text-primary font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="text-sm font-medium text-text-secondary">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-white/10 rounded-lg text-text-primary font-semibold transition hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionsPage;
