import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthState, User, UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import { loginUser, refreshToken as refreshTokenApi, registerUser } from '@/services/api/auth';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth.accessToken) {
          try {
            const decodedToken = jwtDecode<{ exp: number }>(parsedAuth.accessToken);
            const currentTime = Date.now() / 1000;
            
            if (decodedToken.exp > currentTime) {
              return parsedAuth;
            }
          } catch (error) {
            console.error('Error decoding token:', error);
          }
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
      }
    }
    return initialState;
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.setItem('auth', JSON.stringify(auth));
    } else {
      localStorage.removeItem('auth');
    }
  }, [auth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password);
      const { accessToken, refreshToken, user } = response;
      
      setAuth({
        isAuthenticated: true,
        user,
        accessToken,
        refreshToken,
      });
      
      navigate('/dashboard');
      toast.success('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      await registerUser(email, password, firstName, lastName);
      toast.success('Registration successful. Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = () => {
    setAuth(initialState);
    navigate('/login');
    toast.info('You have been logged out');
  };

  const refreshToken = async (): Promise<string | null> => {
    if (!auth.refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await refreshTokenApi(auth.refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = response;
      
      setAuth(prev => ({
        ...prev,
        accessToken,
        refreshToken: newRefreshToken,
      }));
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, register, logout, refreshToken }}>
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