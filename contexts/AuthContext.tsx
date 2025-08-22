import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/chat';
import { authAPI, userAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { NotificationService } from '@/services/notifications';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    try {
      setupNotifications();
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await StorageService.getUser();
      console.log('Utilisateur stocké trouvé:', storedUser);
      if (storedUser) {
        try {
          const userData = await userAPI.getCurrentUser();
          setUser(userData);
          await StorageService.saveUser(userData);
        } catch (error) {
          console.error('Error fetching current user:', error);
          await StorageService.clearAll();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotifications = async () => {
    await NotificationService.registerForPushNotificationsAsync();
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ username, password });
      
      setUser(response.user);
      await StorageService.saveUser(response.user);
      console.log('Utilisateur connecté:', response.user);
      return true;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(userData);
      
      setUser(response.user);
      await StorageService.saveUser(response.user);
      return true;
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authAPI.logout();
      await StorageService.clearAll();
      setUser(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}