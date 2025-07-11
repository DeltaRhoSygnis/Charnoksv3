
import React, { useState, useMemo } from 'react';
import type { Sale, Expense } from '../../types';
import { filterByTimeRange, combineSalesAndExpensesData, TimeRange } from '../../utils/analysis';
import KPICard from '../ui/KPI_Card';
import ChartContainer from '../charts/ChartContainer';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type ChartType = 'bar' | 'line' | 'area';

interface AllWorkersOverviewProps {
    sales: Sale[];
    expenses: Expense[];
}

const AllWorkersOverview: React.FC<AllWorkersOverviewProps> = ({ sales, expenses }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const [chartType, setChartType] = useState<ChartType>('bar');

    const filteredData = useMemo(() => {
        const filteredSales = filterByTimeRange(sales, timeRange);
        const filteredExpenses = filterByTimeRange(expenses, timeRange);
        return { sales: filteredSales, expenses: filteredExpenses };
    }, [sales, expenses, timeRange]);

    const chartData = useMemo(() => {
        return combineSalesAndExpensesData(filteredData.sales, filteredData.expenses);
    }, [filteredData]);

    const totalSales = useMemo(() => filteredData.sales.reduce((sum, s) => sum + s.total, 0), [filteredData.sales]);
    const totalExpenses = useMemo(() => filteredData.expenses.reduce((sum, e) => sum + e.amount, 0), [filteredData.expenses]);
    const netProfit = totalSales - totalExpenses;

    const renderChart = () => {
        const chartProps = {
            data: chartData,
            margin: { top: 5, right: 20, left: -10, bottom: 5 },
        };
        const commonElements = (
            <>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} />
                <YAxis tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} tickFormatter={(value: number) => `$${Math.round(value/1000)}k`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                <Legend wrapperStyle={{paddingTop: '20px'}}/>
            </>
        );

        switch (chartType) {
            case 'line':
                return (
                    <LineChart {...chartProps}>
                        {commonElements}
                        <Line type="monotone" dataKey="sales" stroke="rgb(var(--primary))" name="Sales" dot={false} />
                        <Line type="monotone" dataKey="expenses" stroke="rgb(var(--accent))" name="Expenses" dot={false} />
                    </LineChart>
                );
            case 'area':
                return (
                    <AreaChart {...chartProps}>
                         <defs>
                          <linearGradient id="colorSalesAll" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(var(--primary), 0.8)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="rgba(var(--primary), 0.1)" stopOpacity={0}/>
                          </linearGradient>
                           <linearGradient id="colorExpensesAll" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="rgba(var(--accent), 0.8)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="rgba(var(--accent), 0.1)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        {commonElements}
                        <Area type="monotone" dataKey="sales" name="Sales" stroke="rgb(var(--primary))" fill="url(#colorSalesAll)" />
                        <Area type="monotone" dataKey="expenses" name="Expenses" stroke="rgb(var(--accent))" fill="url(#colorExpensesAll)" />
                    </AreaChart>
                );
            case 'bar':
            default:
                return (
                    <BarChart {...chartProps}>
                        {commonElements}
                        <Bar dataKey="sales" fill="rgba(var(--primary), 0.7)" name="Sales" />
                        <Bar dataKey="expenses" fill="rgba(var(--accent), 0.7)" name="Expenses" />
                    </BarChart>
                );
        }
    };
    
    const timeRanges: {id: TimeRange, label: string}[] = [
        {id: 'today', label: 'Today'},
        {id: '7d', label: '7 Days'},
        {id: '30d', label: '30 Days'},
        {id: '90d', label: '90 Days'},
    ];

    const chartTypes: {id: ChartType, label: string}[] = [
        {id: 'bar', label: 'Bar'},
        {id: 'line', label: 'Line'},
        {id: 'area', label: 'Area'},
    ];


    return (
        <div className="space-y-6">
            <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-lg flex flex-wrap items-center gap-6">
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
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Chart Type</label>
                    <div className="flex items-center bg-black/20 p-1 rounded-lg">
                        {chartTypes.map(type => (
                            <button key={type.id} onClick={() => setChartType(type.id)} className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${chartType === type.id ? 'bg-primary text-text-on-primary' : 'text-text-secondary hover:bg-white/10'}`}>
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Total Sales" value={`$${totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon="💰" />
                <KPICard title="Total Expenses" value={`$${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon="🧾" />
                <KPICard title="Net Profit" value={`$${netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon={netProfit >= 0 ? '📈' : '📉'} />
            </div>

            <ChartContainer title={`Sales vs Expenses (${timeRanges.find(tr=>tr.id === timeRange)?.label})`}>
                <ResponsiveContainer width="100%" height={350}>
                    {renderChart()}
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

export default AllWorkersOverview;
