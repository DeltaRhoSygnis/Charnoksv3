
import React from 'react';

const SUGGESTIONS = [
    "What were my top 3 selling products this week?",
    "Summarize my expenses from the last 7 days.",
    "Suggest one way to improve sales based on current performance.",
    "Which product has the lowest stock?",
];

interface PromptSuggestionsProps {
    onPromptClick: (prompt: string) => void;
}

const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onPromptClick }) => {
    return (
        <div className="flex flex-wrap gap-2 mb-3">
            {SUGGESTIONS.map((prompt, index) => (
                <button
                    key={index}
                    onClick={() => onPromptClick(prompt)}
                    className="px-3 py-1.5 bg-white/10 text-text-secondary text-xs font-semibold rounded-full transition-colors hover:bg-primary/80 hover:text-text-on-primary"
                >
                    {prompt}
                </button>
            ))}
        </div>
    );
};

export default PromptSuggestions;
