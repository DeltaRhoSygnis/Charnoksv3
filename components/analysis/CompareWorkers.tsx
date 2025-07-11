
import React, { useState, useMemo } from 'react';
import type { Sale, Expense, Worker } from '../../types';
import { filterByTimeRange, TimeRange, combineSalesAndExpensesData } from '../../utils/analysis';
import KPICard from '../ui/KPI_Card';
import ChartContainer from '../charts/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CompareWorkersProps {
    sales: Sale[];
    expenses: Expense[];
    workers: Worker[];
}

const CompareWorkers: React.FC<CompareWorkersProps> = ({ sales, expenses, workers }) => {
    const [workerAId, setWorkerAId] = useState<string>(workers[0]?.id || '');
    const [workerBId, setWorkerBId] = useState<string>(workers[1]?.id || '');
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    const workerA = workers.find(w => w.id === workerAId);
    const workerB = workers.find(w => w.id === workerBId);

    const filteredData = useMemo(() => {
        const filteredSales = filterByTimeRange(sales, timeRange);
        const filteredExpenses = filterByTimeRange(expenses, timeRange);

        const salesA = filteredSales.filter(s => s.workerId === workerAId);
        const expensesA = filteredExpenses.filter(e => e.workerId === workerAId);
        const salesB = filteredSales.filter(s => s.workerId === workerBId);
        const expensesB = filteredExpenses.filter(e => e.workerId === workerBId);

        return { salesA, expensesA, salesB, expensesB };
    }, [sales, expenses, workerAId, workerBId, timeRange]);
    
    const totals = useMemo(() => {
        const totalSalesA = filteredData.salesA.reduce((sum, s) => sum + s.total, 0);
        const totalExpensesA = filteredData.expensesA.reduce((sum, e) => sum + e.amount, 0);
        const profitA = totalSalesA - totalExpensesA;

        const totalSalesB = filteredData.salesB.reduce((sum, s) => sum + s.total, 0);
        const totalExpensesB = filteredData.expensesB.reduce((sum, e) => sum + e.amount, 0);
        const profitB = totalSalesB - totalExpensesB;
        
        return { totalSalesA, totalExpensesA, profitA, totalSalesB, totalExpensesB, profitB };
    }, [filteredData]);

    const chartData = [
        { name: 'Total Sales', [workerA?.name || 'A']: totals.totalSalesA, [workerB?.name || 'B']: totals.totalSalesB },
        { name: 'Total Expenses', [workerA?.name || 'A']: totals.totalExpensesA, [workerB?.name || 'B']: totals.totalExpensesB },
        { name: 'Net Profit', [workerA?.name || 'A']: totals.profitA, [workerB?.name || 'B']: totals.profitB },
    ];
    
    const timeRanges: {id: TimeRange, label: string}[] = [
        {id: 'today', label: 'Today'},
        {id: '7d', label: '7 Days'},
        {id: '30d', label: '30 Days'},
        {id: '90d', label: '90 Days'},
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-lg flex flex-wrap items-center gap-6">
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Worker A</label>
                    <select value={workerAId} onChange={e => setWorkerAId(e.target.value)} className="bg-transparent border-2 border-border/50 rounded-lg p-2.5 focus:border-primary focus:ring-0 transition text-text-primary w-48">
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Worker B</label>
                    <select value={workerBId} onChange={e => setWorkerBId(e.target.value)} className="bg-transparent border-2 border-border/50 rounded-lg p-2.5 focus:border-primary focus:ring-0 transition text-text-primary w-48">
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Time Range</label>
                    <div className="flex items-center bg-black/20 p-1 rounded-lg">
                        {timeRanges.map(range => (
                            <button key={range.id} onClick={() => setTimeRange(range.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${timeRange === range.id ? 'bg-primary text-text-on-primary' : 'text-text-secondary hover:bg-white/10'}`}>
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card-bg/50 p-6 rounded-2xl border border-border/50">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">{workerA?.name}</h3>
                    <div className="space-y-4">
                        <KPICard title="Sales" value={`$${totals.totalSalesA.toLocaleString()}`} icon="💰" />
                        <KPICard title="Expenses" value={`$${totals.totalExpensesA.toLocaleString()}`} icon="🧾" />
                        <KPICard title="Net Profit" value={`$${totals.profitA.toLocaleString()}`} icon={totals.profitA >= 0 ? '📈' : '📉'} />
                    </div>
                </div>
                <div className="bg-card-bg/50 p-6 rounded-2xl border border-border/50">
                     <h3 className="text-2xl font-bold text-text-primary mb-4">{workerB?.name}</h3>
                    <div className="space-y-4">
                        <KPICard title="Sales" value={`$${totals.totalSalesB.toLocaleString()}`} icon="💰" />
                        <KPICard title="Expenses" value={`$${totals.totalExpensesB.toLocaleString()}`} icon="🧾" />
                        <KPICard title="Net Profit" value={`$${totals.profitB.toLocaleString()}`} icon={totals.profitB >= 0 ? '📈' : '📉'} />
                    </div>
                </div>
            </div>

            <ChartContainer title="Side-by-Side Comparison">
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} />
                        <YAxis tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} tickFormatter={(value: number) => `$${Math.round(value/1000)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                        <Legend wrapperStyle={{paddingTop: '20px'}}/>
                        <Bar dataKey={workerA?.name || 'A'} fill="rgba(var(--primary), 0.7)" name={workerA?.name} />
                        <Bar dataKey={workerB?.name || 'B'} fill="rgba(var(--accent), 0.7)" name={workerB?.name} />
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>

        </div>
    );
};

export default CompareWorkers;
