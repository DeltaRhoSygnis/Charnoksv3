
import type { Product, Worker, Sale, Expense, Note } from '../types';

export const mockWorkers: Worker[] = [
    { id: 'worker-1', name: 'John Doe' },
    { id: 'worker-2', name: 'Jane Smith' },
    { id: 'worker-3', name: 'Peter Jones' },
];

export const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Fried Chicken', price: 2.50, stock: 100, category: 'Meals', imageUrl: 'https://picsum.photos/seed/chicken/200' },
    { id: 'prod-2', name: 'French Fries', price: 1.50, stock: 200, category: 'Sides', imageUrl: 'https://picsum.photos/seed/fries/200' },
    { id: 'prod-3', name: 'Soda', price: 1.00, stock: 300, category: 'Drinks', imageUrl: 'https://picsum.photos/seed/soda/200' },
    { id: 'prod-4', name: 'Burger', price: 3.50, stock: 80, category: 'Meals', imageUrl: 'https://picsum.photos/seed/burger/200' },
    { id: 'prod-5', name: 'Ice Cream', price: 1.75, stock: 120, category: 'Desserts', imageUrl: 'https://picsum.photos/seed/icecream/200' },
    { id: 'prod-6', name: 'Salad', price: 4.00, stock: 50, category: 'Sides', imageUrl: 'https://picsum.photos/seed/salad/200' },
];

const generateSales = (): Sale[] => {
    const sales: Sale[] = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) { // Generate sales for the last 90 days
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dailySalesCount = Math.floor(Math.random() * 20) + 10; // 10-30 sales per day
        
        for (let j = 0; j < dailySalesCount; j++) {
            const saleId = `sale-${i}-${j}`;
            const numItems = Math.floor(Math.random() * 3) + 1;
            const items = [];
            let total = 0;
            for (let k = 0; k < numItems; k++) {
                const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
                const quantity = Math.floor(Math.random() * 2) + 1;
                items.push({ productId: product.id, quantity, price: product.price });
                total += quantity * product.price;
            }
            const worker = mockWorkers[Math.floor(Math.random() * mockWorkers.length)];
            const saleDate = new Date(date);
            saleDate.setHours(Math.floor(Math.random() * 12) + 9); // Sales between 9 AM and 9 PM
            saleDate.setMinutes(Math.floor(Math.random() * 60));
            
            sales.push({
                id: saleId,
                date: saleDate.toISOString(),
                items,
                total: parseFloat(total.toFixed(2)),
                workerId: worker.id
            });
        }
    }
    return sales;
};

export const mockSales: Sale[] = generateSales();

export const mockExpenses: Expense[] = Array.from({ length: 50 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (i*2));
    const worker = i % 4 !== 0 ? mockWorkers[i % mockWorkers.length] : undefined; // Some expenses are not tied to a worker
    return {
        id: `exp-${i}`,
        date: date.toISOString(),
        description: `Supplier payment #${i+1}`,
        amount: Math.floor(Math.random() * 200) + 50,
        workerId: worker ? worker.id : undefined,
    };
});

export const mockNotes: Note[] = [
    {
        id: 'note-1',
        date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        category: 'Supply Cost',
        title: 'Chicken Supply - Batch 102',
        description: 'Payment for 50kg of fresh chicken from Farm Fresh Inc.',
        amount: 350.50,
    },
    {
        id: 'note-2',
        date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        category: 'Delivery Note',
        title: 'Delivery to Jane Smith Branch',
        description: 'Delivered 10 packs of drumsticks and 5 packs of thighs.',
    },
    {
        id: 'note-3',
        date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
        category: 'Reminder',
        title: 'Check freezer temperature',
        description: 'Need to schedule maintenance for the main storage freezer next week.',
    },
    {
        id: 'note-4',
        date: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
        category: 'Internal Expense',
        title: 'New Knives for Kitchen',
        description: 'Purchased a new set of professional knives.',
        amount: 120.00,
    },
];

export const getSalesDataForCharts = () => {
    const salesByDay: { [key: string]: number } = {};
    mockSales.forEach(sale => {
        const day = new Date(sale.date).toLocaleDateString();
        if(!salesByDay[day]) salesByDay[day] = 0;
        salesByDay[day] += sale.total;
    });

    const last30Days = Object.entries(salesByDay).slice(0, 30).map(([name, sales]) => ({ name, sales })).reverse();
    return last30Days;
};
