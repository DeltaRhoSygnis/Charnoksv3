import React, { useState, useEffect, useRef } from 'react';
import Spinner from '../ui/Spinner';

// Type definitions for the Web Speech API
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void;
    isProcessing: boolean;
    error: string | null;
    onResetError: () => void;
}

const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, isProcessing, error, onResetError }) => {
    type Status = 'idle' | 'listening' | 'denied' | 'unsupported';
    const [status, setStatus] = useState<Status>('idle');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setStatus('unsupported');
            return;
        }
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setStatus('listening');
        recognition.onend = () => setStatus('idle');
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error === 'not-allowed') {
                setStatus('denied');
            }
            console.error('Speech recognition error:', event.error);
        };
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript;
            onTranscript(transcript);
        };
        
        recognitionRef.current = recognition;
    }, [onTranscript]);

    const handleClick = () => {
        if (error) {
            onResetError();
            return;
        }

        if (status === 'listening' || isProcessing) {
            recognitionRef.current?.stop();
            return;
        }

        if (recognitionRef.current) {
            recognitionRef.current.start();
        }
    };
    
    const getButtonContent = () => {
        if (status === 'unsupported') return <span>Voice not supported</span>;
        if (status === 'denied') return <span>Mic access denied</span>;
        if (isProcessing) return <><Spinner size="sm" /> Processing...</>;
        if (error) return <>⚠️ {error.slice(0, 20)}...</>;
        if (status === 'listening') return <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" /> Listening...</div>;

        return <>🎙️ Voice Input</>;
    };

    const getButtonClass = () => {
        let baseClass = "w-full flex items-center justify-center p-3 rounded-lg font-semibold transition-all duration-300 text-text-primary text-lg relative overflow-hidden hover-shimmer";
        if (error) return `${baseClass} bg-red-500/30 border-2 border-red-500`;
        if (isProcessing || status === 'listening') return `${baseClass} bg-primary/30 border-2 border-primary`;
        return `${baseClass} bg-white/10 border-2 border-border/50 hover:border-primary`;
    }

    return (
        <div className="space-y-2">
            <button onClick={handleClick} className={getButtonClass()} disabled={status === 'unsupported' || status === 'denied'}>
                {getButtonContent()}
            </button>
            <div className="flex items-center justify-center text-xs text-text-secondary">
                <span className="mr-2">💡</span>
                <span>Example: "2 fries, 1 burger, 100 pesos"</span>
            </div>
        </div>
    );
};

export default VoiceInputButton;