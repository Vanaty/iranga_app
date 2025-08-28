import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/chat';
import { authAPI, userAPI } from '@/services/api';
import { StorageService } from '@/services/storage';
import { NotificationService } from '@/services/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    setupNotifications();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Vérifier d'abord s'il y a un token stocké
      const token = await AsyncStorage.getItem('authToken');
      console.log('Token trouvé:', !!token);
      
      if (token) {
        try {
          // Essayer de récupérer les informations utilisateur avec le token
          const userData = await userAPI.getCurrentUser();
          console.log('Données utilisateur récupérées:', userData);
          setUser(userData);
          await StorageService.saveUser(userData);
        } catch (error) {
          console.error('Token invalide ou expiré:', error);
          // Token invalide, nettoyer le stockage
          await AsyncStorage.removeItem('authToken');
          await StorageService.clearAll();
          setUser(null);
        }
      } else {
        // Pas de token, vérifier s'il y a des données utilisateur stockées localement
        const storedUser = await StorageService.getUser();
        if (storedUser) {
          console.log('Utilisateur stocké trouvé mais pas de token, nettoyage...');
          await StorageService.clearAll();
        }
        setUser(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut d\'authentification:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNotifications = async () => {
    try {
      await NotificationService.registerForPushNotificationsAsync();
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login({ username, password });
      
      console.log('Réponse de connexion:', response);
      setUser(response.user);
      await StorageService.saveUser(response.user);
      
      // Vérifier que le token a bien été sauvegardé
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('Token sauvegardé après connexion:', !!savedToken);
      
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
      
      // Vérifier que le token a bien été sauvegardé
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('Token sauvegardé après inscription:', !!savedToken);
      
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
    } catch (error) {
      console.error('Erreur API de déconnexion:', error);
      // Continuer même si l'API échoue
    } finally {
      // Nettoyer localement dans tous les cas
      await AsyncStorage.removeItem('authToken');
      await StorageService.clearAll();
      setUser(null);
      console.log('Déconnexion locale réussie, utilisateur:', null);
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