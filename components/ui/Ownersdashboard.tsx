import React from 'react';
import KPICard from '../ui/KPI_Card';
import ChartContainer from '../charts/ChartContainer';
import { mockSales, mockProducts, mockExpenses } from '../../data/mockData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Legend } from 'recharts';

interface CustomizedLabelProps {
    cx: number;
    cy: number;
    midAngle?: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
}

const Ownersdashboard: React.FC = () => {
    const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = totalSales - mockExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const topProduct = mockProducts.sort((a,b) => b.price - a.price)[0];

    const salesLast30Days = mockSales.filter(s => {
        const saleDate = new Date(s.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return saleDate > thirtyDaysAgo;
    });

    const dailySales = salesLast30Days.reduce((acc, sale) => {
        const date = new Date(sale.date).toLocaleDateString('en-CA');
        acc[date] = (acc[date] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(dailySales).map(([date, sales]) => ({
        name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}),
        sales
    })).sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    const productSales = mockSales.flatMap(s => s.items).reduce((acc, item) => {
        acc[item.productId] = (acc[item.productId] || 0) + (item.quantity * item.price);
        return acc;
    }, {} as Record<string, number>);

    const pieChartData = Object.entries(productSales).map(([productId, revenue]) => ({
        name: mockProducts.find(p => p.id === productId)?.name || 'Unknown',
        value: revenue
    })).sort((a,b) => b.value - a.value).slice(0, 5);
    
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];
    
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: CustomizedLabelProps) => {
        if (midAngle === undefined) return null;
        
        const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.07) return null; // Don't render label for small slices

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-xs pointer-events-none">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };


  return (
    <div className="space-y-8">
      <header className="animate-bounce-in">
        <h1 className="text-4xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back, Owner!</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Revenue" value={`$${totalSales.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon="💰" trend="+5.2% this month" trendDirection="up" />
        <KPICard title="Net Profit" value={`$${totalProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} icon="📈" trend="+3.1% this month" trendDirection="up" />
        <KPICard title="Transactions" value={mockSales.length.toLocaleString()} icon="🛒" trend="-1.4% this month" trendDirection="down" />
        <KPICard title="Top Product" value={topProduct.name} icon="🔥" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ChartContainer title="Sales Trend (Last 30 Days)">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgba(var(--primary), 0.8)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="rgba(var(--primary), 0.1)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} />
                <YAxis tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                <Area type="monotone" dataKey="sales" stroke="rgb(var(--primary))" fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        <div className="lg:col-span-2">
            <ChartContainer title="Top 5 Products by Revenue">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomizedLabel}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                        <Legend iconSize={10} wrapperStyle={{fontSize: '12px', color: 'rgb(var(--text-secondary))', paddingBottom: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default Ownersdashboard;