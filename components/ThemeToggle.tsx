import React from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
  size?: number;
  showLabel?: boolean;
}

export function ThemeToggle({ size = 24, showLabel = false }: ThemeToggleProps) {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();
  const [scaleAnim] = React.useState(new Animated.Value(1));

  const handlePress = () => {
    // Animation de pression
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Cycle through theme modes
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Sun size={size} color={theme.text.primary} />;
      case 'dark':
        return <Moon size={size} color={theme.text.primary} />;
      case 'system':
        return <Monitor size={size} color={theme.text.primary} />;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: theme.ui.surfaceVariant,
            borderColor: theme.ui.border,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {getIcon()}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});