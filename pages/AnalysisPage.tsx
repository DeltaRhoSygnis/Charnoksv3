
import React, { useState } from 'react';

// New analysis mode components
import AnalysisHome from '../components/analysis/AnalysisHome';
import AllWorkersOverview from '../components/analysis/AllWorkersOverview';
import CompareWorkers from '../components/analysis/CompareWorkers';
import WorkerInsight from '../components/analysis/WorkerInsight';
import AIPrediction from '../components/analysis/AIPrediction';

// Existing mock data
import { mockSales, mockExpenses, mockWorkers, mockProducts } from '../data/mockData';

export type AnalysisMode = 'home' | 'all-workers' | 'compare-workers' | 'worker-insight' | 'ai-prediction';

const AnalysisPage: React.FC = () => {
    const [mode, setMode] = useState<AnalysisMode>('home');

    const renderContent = () => {
        switch (mode) {
            case 'all-workers':
                return <AllWorkersOverview sales={mockSales} expenses={mockExpenses} />;
            case 'compare-workers':
                return <CompareWorkers sales={mockSales} expenses={mockExpenses} workers={mockWorkers} />;
            case 'worker-insight':
                return <WorkerInsight sales={mockSales} expenses={mockExpenses} workers={mockWorkers} products={mockProducts} />;
            case 'ai-prediction':
                return <AIPrediction />;
            case 'home':
            default:
                return <AnalysisHome setMode={setMode} />;
        }
    };

    const getPageTitle = () => {
        switch (mode) {
            case 'all-workers': return "All Workers Overview";
            case 'compare-workers': return "Compare Workers";
            case 'worker-insight': return "Worker Insight";
            case 'ai-prediction': return "AI-Powered Predictions";
            case 'home':
            default:
                return "Analysis Center";
        }
    };

    return (
        <div className="space-y-6">
            <header className="animate-bounce-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-text-primary">{getPageTitle()}</h1>
                        <p className="text-text-secondary mt-1">
                            {mode === 'home' ? 'Select an analysis mode to begin.' : 'Dive deep into your business data.'}
                        </p>
                    </div>
                    {mode !== 'home' && (
                        <button
                            onClick={() => setMode('home')}
                            className="bg-white/10 hover:bg-white/20 text-text-primary font-semibold py-2 px-4 rounded-lg transition-colors flex items-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            Back to Modes
                        </button>
                    )}
                </div>
            </header>
            
            <div className="animate-slide-in-bottom">
                {renderContent()}
            </div>
        </div>
    );
};

export default AnalysisPage;
