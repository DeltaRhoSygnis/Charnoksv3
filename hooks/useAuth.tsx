import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';

// This would typically come from Firebase Auth, but we'll mock it for now.
interface User {
  uid: string;
  email: string;
  name: string;
  role: 'owner' | 'worker';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  createWorker: (name: string, email: string, pass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_OWNER: User = {
    uid: 'owner-123',
    email: 'owner@charnoks.com',
    name: 'Mr. Charnok',
    role: 'owner',
};

const MOCK_WORKER: User = {
    uid: 'worker-1',
    email: 'worker@charnoks.com',
    name: 'John Doe',
    role: 'worker',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for a saved user session in localStorage
    try {
      const savedUser = window.localStorage.getItem('auth-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Could not read user from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    // Simulate API call to Firebase Auth
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            let userToLogin: User | null = null;
            if (email === MOCK_OWNER.email) {
                userToLogin = MOCK_OWNER;
            } else if (email === MOCK_WORKER.email) {
                userToLogin = MOCK_WORKER;
            }

            if (userToLogin && pass === 'password') { // Basic validation for mock
                try {
                    window.localStorage.setItem('auth-user', JSON.stringify(userToLogin));
                    setUser(userToLogin);
                    resolve();
                } catch (error) => {
                    reject(new Error("Failed to save session."));
                }
            } else {
                reject(new Error("Invalid email or password."));
            }
             setLoading(false);
        }, 1500);
    });
  }, []);

    const signup = useCallback(async (name: string, email: string, pass: string) => {
        setLoading(true);
        // Simulate API call to create and log in a new user.
        // The public sign-up should create an 'owner'.
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (email === MOCK_OWNER.email || email === MOCK_WORKER.email) {
                        return reject(new Error("An account with this email already exists."));
                    }
    
                    const newUser: User = {
                        uid: `owner-${Date.now()}`,
                        email: email,
                        name: name,
                        role: 'owner', // Public signup creates an owner
                    };
                    
                    window.localStorage.setItem('auth-user', JSON.stringify(newUser));
                    setUser(newUser);
                    resolve();

                } catch (error) {
                    reject(new Error("Failed to create session."));
                } finally {
                    setLoading(false);
                }
            }, 1500);
        });
    }, []);

  const logout = useCallback(() => {
    try {
        window.localStorage.removeItem('auth-user');
        setUser(null);
    } catch (error) {
        console.error("Could not remove user from localStorage", error);
    }
  }, []);

  const createWorker = useCallback(async (name: string, email: string, pass: string) => {
    // Simulate API call to create a new worker account without logging in.
    console.log(`Creating worker: ${name} with email: ${email}`);
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            if (email === MOCK_OWNER.email || email === MOCK_WORKER.email) {
                return reject(new Error("An account with this email already exists."));
            }
            // In a real app, this would call a backend function which might fail.
            // For this mock, we'll just resolve successfully.
            resolve();
        }, 1000);
    });
  }, []);

  const value = useMemo(() => ({ user, loading, login, signup, logout, createWorker }), [user, loading, login, signup, logout, createWorker]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
