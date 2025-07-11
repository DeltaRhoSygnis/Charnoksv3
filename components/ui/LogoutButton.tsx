
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };
    
    return (
        <button
            onClick={handleLogout}
            className="flex items-center p-3 my-1 rounded-lg transition-all duration-200 text-text-secondary hover:bg-white/10 hover:text-text-primary w-full"
        >
            <span className="mr-4 text-2xl">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </span>
            <span className="font-semibold">Logout</span>
        </button>
    );
};

export default LogoutButton;
