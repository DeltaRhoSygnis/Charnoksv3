
import React from 'react';
import type { AnalysisMode } from '../../pages/AnalysisPage';

interface ModeButtonProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg text-left w-full h-full flex flex-col transition-all duration-300 hover:scale-105 hover:border-primary/80 hover:shadow-primary/20 relative overflow-hidden hover-shimmer group"
    >
        <div className="flex-grow">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
            <p className="text-text-secondary mt-1">{description}</p>
        </div>
        <div className="mt-4 text-primary font-semibold flex items-center">
            Start Analysis
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </div>
    </button>
);


interface AnalysisHomeProps {
    setMode: (mode: AnalysisMode) => void;
}

const AnalysisHome: React.FC<AnalysisHomeProps> = ({ setMode }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModeButton 
                icon="📈"
                title="All Workers Overview"
                description="Visualize overall sales and expenses for all workers combined."
                onClick={() => setMode('all-workers')}
            />
            <ModeButton 
                icon="📊"
                title="Compare Workers"
                description="Compare performance between two or more workers side-by-side."
                onClick={() => setMode('compare-workers')}
            />
            <ModeButton 
                icon="👤"
                title="Worker Insight"
                description="Deep dive into one worker’s performance and transaction history."
                onClick={() => setMode('worker-insight')}
            />
            <ModeButton 
                icon="🤖"
                title="AI Predictions"
                description="Get AI-powered sales forecasts and strategic business insights."
                onClick={() => setMode('ai-prediction')}
            />
        </div>
    );
};

export default AnalysisHome;
