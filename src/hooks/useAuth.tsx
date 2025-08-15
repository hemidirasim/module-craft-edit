import { useState, useEffect, createContext, useContext } from 'react';

export interface User {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthSession {
  user: User;
  access_token: string;
  expires_at: Date;
}

interface AuthContextType {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createDemoUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        console.log('🔍 Checking session, token:', token ? 'exists' : 'not found');
        
        if (token) {
          // Verify token with backend
          const response = await fetch('/api/auth/verify', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          console.log('🔍 Verify response status:', response.status);

          if (response.ok) {
            const sessionData = await response.json();
            console.log('✅ Session verified:', sessionData);
            setSession(sessionData.session);
            setUser(sessionData.session.user);
          } else {
            console.log('❌ Token invalid, clearing');
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('❌ Session check error:', error);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in with:', email);
      
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 Signin response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign in failed');
      }

      const data = await response.json();
      console.log('✅ Signin response:', data);
      
      const sessionData = data.session;
      console.log('🔐 Session data:', sessionData);

      // Store token
      localStorage.setItem('auth_token', sessionData.access_token);
      console.log('💾 Token stored:', sessionData.access_token ? 'yes' : 'no');
      
      setSession(sessionData);
      setUser(sessionData.user);
      console.log('👤 User set:', sessionData.user);
    } catch (error) {
      console.error('❌ Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sign up failed');
      }

      const data = await response.json();
      const sessionData = data.session;

      // Store token
      localStorage.setItem('auth_token', sessionData.access_token);
      
      setSession(sessionData);
      setUser(sessionData.user);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    setSession(null);
    setUser(null);
  };

  const createDemoUser = async () => {
    try {
      const response = await fetch('/api/auth/demo', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Demo user creation failed');
      }

      const data = await response.json();
      const sessionData = data.session;

      // Store token
      localStorage.setItem('auth_token', sessionData.access_token);
      
      setSession(sessionData);
      setUser(sessionData.user);
    } catch (error) {
      console.error('Demo user creation error:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    createDemoUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};