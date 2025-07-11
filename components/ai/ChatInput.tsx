
import React, { useState, useEffect, useRef } from 'react';

// Speech Recognition types
interface SpeechRecognitionErrorEvent extends Event { error: string; }
interface SpeechRecognitionEvent extends Event { results: { [index: number]: { [index: number]: { transcript: string; }; }; }; }
interface SpeechRecognition extends EventTarget {
  continuous: boolean; lang: string; interimResults: boolean;
  onstart: () => void; onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void; stop: () => void;
}
declare global {
  interface Window { SpeechRecognition: new () => SpeechRecognition; webkitSpeechRecognition: new () => SpeechRecognition; }
}

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionAPI) {
            console.warn("Speech Recognition API not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            onSendMessage(transcript);
        };
        recognitionRef.current = recognition;
    }, [onSendMessage]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleVoiceClick = () => {
        if (isLoading) return;
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleVoiceClick}
                disabled={!recognitionRef.current}
                className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 text-text-primary hover:bg-white/20'}`}
                aria-label="Use voice input"
            >
                {isListening ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a3 3 0 016 0v8a3 3 0 01-6 0V3z" />
                        <path d="M3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                )}
            </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening...' : 'Ask the AI anything...'}
                disabled={isLoading || isListening}
                className="w-full bg-white/5 border-2 border-border/50 rounded-full py-3 px-5 focus:border-primary focus:ring-0 transition text-text-primary placeholder-text-secondary"
            />
            <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-text-on-primary transition-transform hover:scale-110 disabled:scale-100 disabled:opacity-50"
                aria-label="Send message"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
            </button>
        </form>
    );
};

export default ChatInput;
