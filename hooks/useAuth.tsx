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

const MOCK_USERS_KEY = 'mock-users';
const AUTH_USER_KEY = 'auth-user';


// Helper to get all users from our mock DB
const getMockUsers = (): User[] => {
    try {
        const storedUsers = window.localStorage.getItem(MOCK_USERS_KEY);
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
    } catch (error) {
        console.error("Could not read users from localStorage", error);
    }
    // If nothing is stored, seed with initial users
    const initialUsers = [MOCK_OWNER, MOCK_WORKER];
    try {
        window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initialUsers));
    } catch (error) {
        console.error("Could not save initial users to localStorage", error);
    }
    return initialUsers;
};

// Helper to save users to our mock DB
const saveMockUsers = (users: User[]) => {
    try {
        window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Could not save users to localStorage", error);
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for a saved user session in localStorage
    try {
      getMockUsers(); // This will seed the user DB if it doesn't exist.
      const savedUser = window.localStorage.getItem(AUTH_USER_KEY);
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
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            const allUsers = getMockUsers();
            const userToLogin = allUsers.find(u => u.email === email);

            if (userToLogin && pass === 'password') { // Basic validation for mock
                try {
                    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userToLogin));
                    setUser(userToLogin);
                    resolve();
                } catch (error) {
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
        // Simulate creating and logging in a new 'owner' user.
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                try {
                    const allUsers = getMockUsers();
                    if (allUsers.some(u => u.email === email)) {
                        setLoading(false);
                        return reject(new Error("An account with this email already exists."));
                    }
    
                    const newUser: User = {
                        uid: `owner-${Date.now()}`,
                        email,
                        name,
                        role: 'owner',
                    };
                    
                    // Add new user to our mock "database"
                    const updatedUsers = [...allUsers, newUser];
                    saveMockUsers(updatedUsers);

                    // Set current session
                    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
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
        window.localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
    } catch (error) {
        console.error("Could not remove user from localStorage", error);
    }
  }, []);

  const createWorker = useCallback(async (name: string, email: string, pass: string) => {
    // Simulate creating a new worker account.
    return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            try {
                const allUsers = getMockUsers();
                if (allUsers.some(u => u.email === email)) {
                    return reject(new Error("An account with this email already exists."));
                }

                const newWorker: User = {
                    uid: `worker-${Date.now()}`,
                    email,
                    name,
                    role: 'worker',
                };
                
                const updatedUsers = [...allUsers, newWorker];
                saveMockUsers(updatedUsers);
                
                resolve();
            } catch (error) {
                reject(new Error("Failed to create worker account."));
            }
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
