import React, { useState, useEffect, useRef } from 'react';
import ChatBubble from '../components/ai/ChatBubble';
import ChatInput from '../components/ai/ChatInput';
import PromptSuggestions from '../components/ai/PromptSuggestions';
import { getAIAssistantResponse } from '../services/geminiService';
import { mockSales, mockExpenses, mockProducts } from '../data/mockData';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
    isError?: boolean;
}

const INITIAL_MESSAGE: Message = {
    id: 1,
    sender: 'ai',
    text: `Hello! I'm your AI-powered business assistant.
I have access to your sales, expenses, and product data.

**Here are a few things you can ask:**
- What were my top selling products this week?
- Summarize my expenses for the last 7 days.
- Suggest one way to improve sales.

How can I help you today?`
};

const AIAssistantPage: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [lastMessageId, setLastMessageId] = useState<number>(INITIAL_MESSAGE.id);

    useEffect(() => {
        // Scroll to the latest message
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSendMessage = async (query: string) => {
        if (!query.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: query, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        
        // Prepare history for the AI, excluding the initial prompt for brevity
        const historyForAI = messages.slice(1).map(m => ({ text: m.text, sender: m.sender as 'user' | 'ai' }));

        try {
            const responseText = await getAIAssistantResponse(query, historyForAI, mockSales, mockExpenses, mockProducts);
            const aiMessage: Message = { id: Date.now() + 1, text: responseText, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
            setLastMessageId(aiMessage.id);
        } catch (error: any) {
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: error.message || "Sorry, I'm having trouble connecting. Please try again later.",
                sender: 'ai',
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
            setLastMessageId(errorMessage.id);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="animate-bounce-in">
                <h1 className="text-4xl font-bold text-text-primary">AI Assistant</h1>
                <p className="text-text-secondary mt-1">Your intelligent business partner, powered by Gemini.</p>
            </header>

            <div className="flex flex-col h-[calc(100vh-220px)] min-h-[500px] bg-card-bg/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-4 sm:p-6">
                <div ref={chatContainerRef} className="flex-grow overflow-y-auto pr-2 space-y-4">
                    {messages.map((msg) => (
                        <ChatBubble
                            key={msg.id}
                            sender={msg.sender}
                            text={msg.text}
                            isError={msg.isError}
                            animate={msg.sender === 'ai' && msg.id === lastMessageId && !msg.isError}
                        />
                    ))}
                    {isLoading && <ChatBubble sender="ai" text="" isTyping />}
                    <div />
                </div>

                <div className="mt-6 flex-shrink-0">
                    <PromptSuggestions onPromptClick={handleSendMessage} />
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
};

export default AIAssistantPage;