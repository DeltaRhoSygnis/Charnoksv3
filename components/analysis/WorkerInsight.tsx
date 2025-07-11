
import React, { useState, useMemo } from 'react';
import type { Sale, Expense, Worker, Product } from '../../types';
import { filterByTimeRange, TimeRange, combineSalesAndExpensesData } from '../../utils/analysis';
import KPICard from '../ui/KPI_Card';
import ChartContainer from '../charts/ChartContainer';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface WorkerInsightProps {
    sales: Sale[];
    expenses: Expense[];
    workers: Worker[];
    products: Product[];
}

const WorkerInsight: React.FC<WorkerInsightProps> = ({ sales, expenses, workers, products }) => {
    const [workerId, setWorkerId] = useState<string>(workers[0]?.id || '');
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');

    const worker = workers.find(w => w.id === workerId);

    const filteredData = useMemo(() => {
        const filteredSales = filterByTimeRange(sales, timeRange).filter(s => s.workerId === workerId);
        const filteredExpenses = filterByTimeRange(expenses, timeRange).filter(e => e.workerId === workerId);
        return { sales: filteredSales, expenses: filteredExpenses };
    }, [sales, expenses, workerId, timeRange]);

    const chartData = useMemo(() => {
        return combineSalesAndExpensesData(filteredData.sales, filteredData.expenses);
    }, [filteredData]);
    
    const kpis = useMemo(() => {
        const totalSales = filteredData.sales.reduce((sum, s) => sum + s.total, 0);
        const totalExpenses = filteredData.expenses.reduce((sum, e) => sum + e.amount, 0);
        const netProfit = totalSales - totalExpenses;
        const transactions = filteredData.sales.length;
        return { totalSales, totalExpenses, netProfit, transactions };
    }, [filteredData]);

    const productBreakdown = useMemo(() => {
        const categorySales: Record<string, number> = {};
        filteredData.sales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const category = product.category || 'Uncategorized';
                    categorySales[category] = (categorySales[category] || 0) + (item.quantity * item.price);
                }
            });
        });
        return Object.entries(categorySales).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
    }, [filteredData.sales, products]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    
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
                    <label className="block text-sm font-medium text-text-secondary mb-1">Select Worker</label>
                    <select value={workerId} onChange={e => setWorkerId(e.target.value)} className="bg-transparent border-2 border-border/50 rounded-lg p-2.5 focus:border-primary focus:ring-0 transition text-text-primary w-48">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Sales" value={`$${kpis.totalSales.toLocaleString()}`} icon="💰" />
                <KPICard title="Expenses" value={`$${kpis.totalExpenses.toLocaleString()}`} icon="🧾" />
                <KPICard title="Net Profit" value={`$${kpis.netProfit.toLocaleString()}`} icon={kpis.netProfit >= 0 ? '📈' : '📉'} />
                <KPICard title="Transactions" value={kpis.transactions.toLocaleString()} icon="🛒" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <ChartContainer title={`Sales Trend for ${worker?.name}`}>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorSalesWorker" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgba(var(--primary), 0.8)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="rgba(var(--primary), 0.1)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} />
                                <YAxis tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} tickFormatter={(value: number) => `$${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                                <Area type="monotone" dataKey="sales" name="Sales" stroke="rgb(var(--primary))" fill="url(#colorSalesWorker)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="lg:col-span-2">
                    <ChartContainer title="Sales by Category">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={productBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                    {productBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                                <Legend iconSize={10} wrapperStyle={{fontSize: '12px', color: 'rgb(var(--text-secondary))', paddingBottom: '20px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
            </div>

            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
                <div className="overflow-auto max-h-[40vh]">
                    <table className="w-full text-left table-auto">
                        <thead className="sticky top-0 bg-card-bg-solid/80 backdrop-blur-sm">
                            <tr>
                                <th className="p-3 font-semibold text-text-secondary">Date</th>
                                <th className="p-3 font-semibold text-text-secondary">Items</th>
                                <th className="p-3 font-semibold text-text-secondary text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.sales.slice(0, 20).map(sale => (
                                <tr key={sale.id} className="border-b border-border/50 hover:bg-white/5">
                                    <td className="p-3 whitespace-nowrap">{new Date(sale.date).toLocaleString()}</td>
                                    <td className="p-3">{sale.items.length}</td>
                                    <td className="p-3 text-right font-semibold text-green-400 whitespace-nowrap">{`$${sale.total.toFixed(2)}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default WorkerInsight;
