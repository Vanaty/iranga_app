import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  primary: {
    main: string;
    dark: string;
    light: string;
    accent: string;
  };
  background: {
    primary: string;
    secondary: string;
    card: string;
    chat: string;
    input: string;
    modal: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    white: string;
    muted: string;
    inverse: string;
  };
  status: {
    online: string;
    offline: string;
    typing: string;
    typingBg: string;
    typingDot: string;
    error: string;
    warning: string;
    success: string;
  };
  message: {
    sent: string;
    received: string;
    border: string;
    shadow: string;
  };
  ui: {
    border: string;
    shadow: string;
    overlay: string;
    divider: string;
    surface: string;
    surfaceVariant: string;
  };
}

const lightTheme: ThemeColors = {
  primary: {
    main: '#128C7E',
    dark: '#128C7E',
    light: '#DCF8C6',
    accent: '#1aaa8bff',
  },
  background: {
    primary: '#F7F3F0',
    secondary: '#ECE5DD',
    card: '#FFFFFF',
    chat: '#E8DDD4',
    input: '#F5F1ED',
    modal: '#FFFFFF',
  },
  text: {
    primary: '#2D3748',
    secondary: '#4A5568',
    tertiary: '#718096',
    white: '#FFFFFF',
    muted: '#A0AEC0',
    inverse: '#FFFFFF',
  },
  status: {
    online: '#38A169',
    offline: '#9CA3AF',
    typing: '#ED8936',
    typingBg: '#F7FAFC',
    typingDot: '#4A5568',
    error: '#E53E3E',
    warning: '#D69E2E',
    success: '#38A169',
  },
  message: {
    sent: '#D4EDDA',
    received: '#FFFFFF',
    border: '#E2E8F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  ui: {
    border: '#E2E8F0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    divider: '#EDF2F7',
    surface: '#FFFFFF',
    surfaceVariant: '#F8FAFC',
  },
};

const darkTheme: ThemeColors = {
  primary: {
    main: '#25D366',
    dark: '#1DA851',
    light: '#128C7E',
    accent: '#34D399',
  },
  background: {
    primary: '#0F172A',
    secondary: '#1E293B',
    card: '#1E293B',
    chat: '#111827',
    input: '#374151',
    modal: '#1F2937',
  },
  text: {
    primary: '#F1F5F9',
    secondary: '#CBD5E1',
    tertiary: '#94A3B8',
    white: '#FFFFFF',
    muted: '#64748B',
    inverse: '#1F2937',
  },
  status: {
    online: '#10B981',
    offline: '#6B7280',
    typing: '#F59E0B',
    typingBg: '#374151',
    typingDot: '#9CA3AF',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  message: {
    sent: '#1F2937',
    received: '#374151',
    border: '#4B5563',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  ui: {
    border: '#374151',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.7)',
    divider: '#374151',
    surface: '#1F2937',
    surfaceVariant: '#374151',
  },
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    loadThemePreference();
    
    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Set initial system theme
    setSystemTheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

    return () => subscription?.remove();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themeMode');
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const currentIsDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');
    setThemeMode(currentIsDark ? 'light' : 'dark');
  };

  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isDark,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}