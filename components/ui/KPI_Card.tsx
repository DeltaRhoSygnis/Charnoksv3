import React from 'react';

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down';
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, trend, trendDirection }) => {
  const trendColor = trendDirection === 'up' ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-card-bg-solid p-6 rounded-2xl shadow-lg border border-border/50 animate-bounce-in transition-all duration-300 hover:scale-105 hover:shadow-2xl relative overflow-hidden hover-shimmer">
      <div className="flex justify-between items-start">
        <p className="text-lg font-semibold text-text-secondary">{title}</p>
        <div className="text-3xl text-primary opacity-80">{icon}</div>
      </div>
      <p className="text-4xl font-bold mt-2 text-text-primary">{value}</p>
      {trend && (
        <p className={`mt-2 text-sm flex items-center ${trendColor}`}>
          {trendDirection === 'up' ? '▲' : '▼'}
          <span className="ml-1">{trend}</span>
        </p>
      )}
    </div>
  );
};

export default KPICard;