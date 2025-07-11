
import React from 'react';
import { Link } from 'react-router-dom';
import KPICard from '../components/ui/KPI_Card';

const WorkerDashboard: React.FC = () => {
    // Mock data for worker dashboard
    const salesToday = 15;
    const revenueToday = 250.75;

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-secondary mt-1">Here's your summary for today.</p>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <KPICard title="Your Sales Today" value={salesToday.toString()} icon="🛒" />
                <KPICard title="Your Revenue Today" value={`$${revenueToday.toFixed(2)}`} icon="💰" />
            </div>

            <div className="animate-slide-in-bottom">
                 <Link 
                    to="/worker/sales" 
                    className="block w-full text-center p-6 bg-primary rounded-2xl text-text-on-primary font-bold text-2xl transition-transform duration-300 hover:scale-105 shadow-lg"
                 >
                    + Record a New Sale
                </Link>
            </div>
        </div>
    );
};

export default WorkerDashboard;
