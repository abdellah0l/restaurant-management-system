import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
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

interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user: User;
}

interface VerificationResponse {
  success: boolean;
  message: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  requestVerificationCode: (email?: string, password?: string) => Promise<boolean>;
  updateProfile: (verificationCode: string, email?: string, password?: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const requestVerificationCode = async (email?: string, password?: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const requestData: any = {};
      if (email) requestData.email = email;
      if (password) requestData.password = password;

      const response = await axios.post(`${API_BASE}/auth/request-verification`, requestData, {
        withCredentials: true
      });

      const data = response.data as VerificationResponse;
      return data.success;
    } catch (error: any) {
      console.error('Verification request error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('حدث خطأ أثناء إرسال رمز التحقق');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (verificationCode: string, email?: string, password?: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const updateData: any = { verificationCode };
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const response = await axios.put(`${API_BASE}/auth/profile`, updateData, {
        withCredentials: true
      });

      const data = response.data as ProfileUpdateResponse;
      if (data.success) {
        setUser(data.user);
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Profile update error:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('حدث خطأ أثناء تحديث الملف الشخصي');
      }
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      requestVerificationCode,
      updateProfile,
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