
import React, { useState, useEffect } from 'react';
import { getSalesForecast, getBusinessInsights } from '../../services/geminiService';
import { mockSales, mockExpenses } from '../../data/mockData';
import type { ForecastDataPoint, AIInsights } from '../../types';
import Spinner from '../ui/Spinner';
import ChartContainer from '../charts/ChartContainer';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const AIInsightCard: React.FC<{ title: string; items: string[]; icon: string; className: string }> = ({ title, items, icon, className }) => (
    <div className={`bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg h-full ${className}`}>
        <div className="flex items-center mb-4">
            <span className="text-3xl mr-3">{icon}</span>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
        </div>
        <ul className="space-y-2 list-disc list-inside text-text-secondary">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);

const AIPrediction: React.FC = () => {
    const [forecast, setForecast] = useState<ForecastDataPoint[] | null>(null);
    const [insights, setInsights] = useState<AIInsights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAIData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [forecastData, insightsData] = await Promise.all([
                    getSalesForecast(mockSales),
                    getBusinessInsights(mockSales, mockExpenses)
                ]);
                setForecast(forecastData);
                setInsights(insightsData);
            } catch (err) {
                console.error("AI Analysis Error:", err);
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred while fetching AI analysis.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAIData();
    }, []);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <Spinner size="lg" />
                    <p className="mt-4 text-text-secondary">AI is analyzing your data...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center p-10 bg-red-900/20 rounded-2xl border border-red-500/50">
                    <h2 className="text-2xl font-bold text-red-300">Analysis Failed</h2>
                    <p className="text-red-400 mt-2">{error}</p>
                    <p className="text-text-secondary mt-4 text-sm">Please ensure your Gemini API key is configured correctly.</p>
                </div>
            );
        }

        return (
            <div className="space-y-8">
                {forecast && (
                    <div style={{ animationDelay: '100ms' }}>
                        <ChartContainer title="7-Day Sales Forecast">
                             <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={forecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <defs>
                                      <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="rgba(var(--accent), 0.8)" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="rgba(var(--accent), 0.1)" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="day" tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} />
                                    <YAxis tick={{ fill: 'rgb(var(--text-secondary))' }} fontSize={12} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem' }} />
                                    <Legend wrapperStyle={{paddingTop: '20px'}}/>
                                    <Area type="monotone" dataKey="predictedSales" name="Predicted Sales" stroke="rgb(var(--accent))" fill="url(#colorForecast)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                )}
                {insights && (
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div style={{ animationDelay: '200ms' }}>
                            <AIInsightCard title="Insights" items={insights.insights} icon="💡" className="border-blue-500/50" />
                        </div>
                        <div style={{ animationDelay: '300ms' }}>
                            <AIInsightCard title="Opportunities" items={insights.opportunities} icon="🚀" className="border-green-500/50" />
                        </div>
                        <div style={{ animationDelay: '400ms' }}>
                            <AIInsightCard title="Risks" items={insights.risks} icon="⚠️" className="border-red-500/50" />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {renderContent()}
        </div>
    );
};

export default AIPrediction;
