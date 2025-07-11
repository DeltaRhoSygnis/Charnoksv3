import React, { useState, useEffect } from 'react';
import Spinner from '../ui/Spinner';

interface ChatBubbleProps {
    sender: 'user' | 'ai';
    text: string;
    isTyping?: boolean;
    isError?: boolean;
    animate?: boolean;
}

const TypingCursor: React.FC = () => (
    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1" />
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, text, isTyping = false, isError = false, animate = false }) => {
    const [displayedText, setDisplayedText] = useState(animate ? '' : text);
    const [isAnimating, setIsAnimating] = useState(animate);

    useEffect(() => {
        // Reset animation state if text or animate prop changes
        setDisplayedText(animate ? '' : text);
        setIsAnimating(animate);

        if (animate) {
            let i = 0;
            const intervalId = setInterval(() => {
                setDisplayedText(text.substring(0, i + 1));
                i++;
                if (i >= text.length) {
                    clearInterval(intervalId);
                    setIsAnimating(false);
                }
            }, 20); // Typing speed

            return () => clearInterval(intervalId);
        }
    }, [text, animate]);


    const isUser = sender === 'user';
    const bubbleClasses = isUser
        ? 'text-text-on-primary self-end'
        : `bg-card-bg-solid text-text-primary self-start ${isError ? 'border border-red-500/50' : ''}`;
    
    const userBubbleStyle = isUser ? {
        background: `linear-gradient(135deg, rgb(var(--primary)), rgb(var(--secondary)))`
    } : {};

    // A simple markdown-to-HTML converter
    const formatText = (inputText: string) => {
        return inputText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
            .replace(/^- (.*$)/gm, '<ul class="list-disc list-inside ml-2"><li>$1</li></ul>') // Lists
            .replace(/\n/g, '<br />');
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div 
              style={userBubbleStyle}
              className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-md animate-bounce-in ${bubbleClasses}`}
            >
                {isTyping ? (
                    <div className="flex items-center space-x-2">
                        <Spinner size="sm" />
                        <span className="text-text-secondary text-sm">AI is thinking...</span>
                    </div>
                ) : (
                    <div className="flex items-start">
                      <div className="prose prose-invert prose-sm min-h-[1em]" dangerouslySetInnerHTML={{ __html: formatText(displayedText) }} />
                      {isAnimating && <TypingCursor />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;