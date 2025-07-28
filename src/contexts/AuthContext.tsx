import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use environment variable for API URL in production, fallback to proxy in development
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
          withCredentials: true
        });
        
        const data = response.data as UserResponse;
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        // User is not authenticated, which is fine
        console.log('User not authenticated');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true
      });

      const data = response.data as AuthResponse;
      if (data.success) {
        // Get current user info after successful login
        const userResponse = await axios.get(`${API_BASE}/auth/me`, {
          withCredentials: true
        });
        
        const userData = userResponse.data as UserResponse;
        if (userData.success) {
          setUser(userData.user);
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.status === 401) {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
      } else if (error.response?.status === 404) {
        setError('البريد الإلكتروني غير موجود');
      } else {
        setError('حدث خطأ أثناء تسجيل الدخول');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await axios.post(`${API_BASE}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };


  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};