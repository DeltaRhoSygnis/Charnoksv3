
import type { Sale, Expense } from '../types';

export type TimeRange = 'today' | '7d' | '30d' | '90d';

export const filterByTimeRange = <T extends { date: string }>(data: T[], range: TimeRange): T[] => {
    const now = new Date();
    let startDate = new Date(now);

    switch(range) {
        case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
        case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
        case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        case '90d':
            startDate.setDate(now.getDate() - 90);
            break;
    }
    
    return data.filter(item => new Date(item.date) >= startDate && new Date(item.date) <= now);
};

export const aggregateSalesByDay = (sales: Sale[]) => {
    const dailyData = sales.reduce((acc, sale) => {
        const date = new Date(sale.date).toLocaleDateString('en-CA');
        acc[date] = (acc[date] || 0) + sale.total;
        return acc;
    }, {} as Record<string, number>);

    return Object.entries(dailyData)
        .map(([date, total]) => ({ name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}), sales: total }))
        .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
}

export const aggregateExpensesByDay = (expenses: Expense[]) => {
    const dailyData = expenses.reduce((acc, expense) => {
        const date = new Date(expense.date).toLocaleDateString('en-CA');
        acc[date] = (acc[date] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

     return Object.entries(dailyData)
        .map(([date, total]) => ({ name: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}), expenses: total }))
        .sort((a,b) => new Date(a.name).getTime() - new Date(b.name).getTime());
}

// Combine sales and expenses for charts
export const combineSalesAndExpensesData = (sales: Sale[], expenses: Expense[]) => {
    const combined: Record<string, {sales: number, expenses: number}> = {};

    sales.forEach(sale => {
        const date = new Date(sale.date).toLocaleDateString('en-CA');
        if (!combined[date]) combined[date] = { sales: 0, expenses: 0 };
        combined[date].sales += sale.total;
    });

    expenses.forEach(expense => {
        const date = new Date(expense.date).toLocaleDateString('en-CA');
        if (!combined[date]) combined[date] = { sales: 0, expenses: 0 };
        combined[date].expenses += expense.amount;
    });

    return Object.entries(combined)
        .map(([date, {sales, expenses}]) => ({ 
            name: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }), 
            sales,
            expenses
        }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
};
