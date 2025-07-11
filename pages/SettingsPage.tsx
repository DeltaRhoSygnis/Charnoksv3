
import React, { useState } from 'react';
import ThemeSelector from '../components/ui/ThemeSelector';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const CreateWorkerForm: React.FC = () => {
    const { createWorker } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        
        if (!name || !email || !password) {
            setError("All fields are required.");
            return;
        }

        setIsLoading(true);

        try {
            await createWorker(name, email, password);
            setSuccess(`Worker account for ${name} created successfully! An email would be sent in a real app.`);
            // Reset form
            setName('');
            setEmail('');
            setPassword('');
        } catch (err: any) {
            setError(err.message || 'Failed to create worker account.');
        } finally {
            setIsLoading(false);
            setTimeout(() => setSuccess(null), 5000);
        }
    };

    return (
        <div className="bg-card-bg/80 backdrop-blur-sm rounded-2xl p-6 border border-border/50 shadow-lg mt-8 animate-slide-in-bottom">
            <h3 className="text-xl font-bold mb-4 text-text-primary">Create Worker Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="worker-name" className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                        <input type="text" id="worker-name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                    </div>
                    <div>
                        <label htmlFor="worker-email" className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                        <input type="email" id="worker-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                    </div>
                </div>
                <div>
                    <label htmlFor="worker-password" className="block text-sm font-medium text-text-secondary mb-1">Temporary Password</label>
                    <input type="password" id="worker-password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-transparent border-2 border-border/50 rounded-lg p-3 focus:border-primary focus:ring-0 transition" />
                </div>

                {error && <div className="text-red-400 text-sm bg-red-500/10 p-2 rounded-lg">{error}</div>}
                {success && <div className="text-green-400 text-sm bg-green-500/10 p-2 rounded-lg">{success}</div>}

                <div className="flex justify-end">
                    <button type="submit" disabled={isLoading} className="px-6 py-3 rounded-lg bg-primary text-text-on-primary font-bold transition hover:bg-primary/80 disabled:opacity-50 flex items-center justify-center">
                        {isLoading && <Spinner size="sm" />}
                        <span className={isLoading ? 'ml-2' : ''}>Create Account</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-8">
      <header className="animate-bounce-in">
        <h1 className="text-4xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Configure your application.</p>
      </header>
      
      <div className="max-w-4xl mx-auto">
        <ThemeSelector />
        
        {user?.role === 'owner' && <CreateWorkerForm />}
      </div>
    </div>
  );
};

export default SettingsPage;
