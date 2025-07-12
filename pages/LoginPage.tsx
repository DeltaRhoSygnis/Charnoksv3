import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
    </svg>
);

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781z" clipRule="evenodd" />
        <path d="M2 10s3.939-7 8-7 8 7 8 7-3.939 7-8 7-8-7-8-7zm7.939 2.553a2.5 2.5 0 01-3.498-3.498l3.498 3.498z" />
    </svg>
);

const LogoIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-white">
        <path d="M12 2L2 8.5v7L12 22l10-6.5v-7L12 2zM3.5 9.75l8.5-5.5 8.5 5.5v4.5l-8.5 5.5-8.5-5.5v-4.5z" opacity={0.5}/>
        <path d="M12 5.5l-6.5 4.25v1.5L12 15.5l6.5-4.25v-1.5L12 5.5zM4 10v4l8 5 8-5v-4l-8-5-8 5zm2 1.5l6 3.5 6-3.5-6 3.5-6-3.5z"/>
    </svg>
);

const LoginPage: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();
    const auth = useAuth();
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isDemoLoggingIn, setIsDemoLoggingIn] = useState<'owner' | 'worker' | null>(null);

    const from = (location.state as any)?.from?.pathname || "/";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);
        try {
            await auth.login(email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Failed to log in. Please check your credentials.");
        } finally {
            setIsLoggingIn(false);
        }
    };
    
    const handleDemoLogin = async (role: 'owner' | 'worker') => {
        setError('');
        setIsDemoLoggingIn(role);
        try {
            const email = role === 'owner' ? 'owner@charnoks.com' : 'worker@charnoks.com';
            await auth.login(email, 'password');
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || "Failed to log in.");
        } finally {
            setIsDemoLoggingIn(null);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-6">
                <div className="flex justify-center animate-bounce-in" style={{animationDelay: '100ms'}}>
                    <LogoIcon />
                </div>

                <h2 className="text-3xl font-bold text-center text-white animate-bounce-in" style={{animationDelay: '200ms'}}>Account Login</h2>

                <form className="space-y-5 animate-bounce-in" style={{animationDelay: '300ms'}} onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email-address" className="sr-only">Username or Email address</label>
                         <div className="flex items-center bg-accent/20 rounded-lg p-1 border border-transparent focus-within:border-white/50">
                            <span className="px-3 text-white/70"><UserIcon /></span>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full bg-transparent py-2.5 pr-3 text-white placeholder-white/60 focus:outline-none"
                                placeholder="Username or Email address"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <div className="flex items-center bg-accent/20 rounded-lg p-1 border border-transparent focus-within:border-white/50">
                             <span className="px-3 text-white/70"><LockIcon /></span>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full bg-transparent py-2.5 text-white placeholder-white/60 focus:outline-none"
                                placeholder="Password"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-white/70 focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-300 text-sm text-center bg-red-500/20 p-2 rounded-lg">{error}</p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded bg-white/30 border-border/50 text-primary focus:ring-primary" />
                            <label htmlFor="remember-me" className="text-white/80">Remember Me</label>
                        </div>
                        <a href="#" className="font-medium text-white/80 hover:text-white">Forgot password?</a>
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoggingIn || !!isDemoLoggingIn}
                            className="w-full flex justify-center py-3 px-4 text-base font-bold rounded-lg text-text-on-primary bg-card-bg-solid shadow-lg shadow-black/20 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-primary disabled:opacity-50"
                        >
                            {isLoggingIn ? <Spinner size="sm" /> : 'Login'}
                        </button>
                    </div>
                </form>

                <div className="animate-bounce-in" style={{animationDelay: '400ms'}}>
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/50"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-card-bg text-text-secondary rounded-full">Quick Demo Login</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('owner')}
                            disabled={isLoggingIn || !!isDemoLoggingIn}
                            className="w-full flex justify-center items-center py-2.5 px-4 font-semibold rounded-lg border-2 border-border/50 text-text-secondary transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            {isDemoLoggingIn === 'owner' ? <Spinner size="sm" /> : 'Login as Owner'}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDemoLogin('worker')}
                            disabled={isLoggingIn || !!isDemoLoggingIn}
                            className="w-full flex justify-center items-center py-2.5 px-4 font-semibold rounded-lg border-2 border-border/50 text-text-secondary transition hover:bg-white/10 hover:text-white disabled:opacity-50"
                        >
                            {isDemoLoggingIn === 'worker' ? <Spinner size="sm" /> : 'Login as Worker'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-sm text-white/60 animate-bounce-in" style={{animationDelay: '500ms'}}>
                    Don't have an account? <ReactRouterDOM.Link to="/signup" className="font-medium text-white/80 hover:text-white">Sign Up</ReactRouterDOM.Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
