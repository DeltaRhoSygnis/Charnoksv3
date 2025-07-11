
import React from 'react';

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => {
  return (
    <div className="bg-card-bg backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-border shadow-lg h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 text-text-primary">{title}</h3>
      <div className="flex-grow w-full h-64 sm:h-80">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
