import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';

interface ModernCardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'small' | 'medium' | 'large' | 'xl';
  style?: ViewStyle;
}

export function ModernCard({
  children,
  variant = 'default',
  padding = 'medium',
  borderRadius = 'medium',
  style,
  ...props
}: ModernCardProps) {
  const getCardStyle = () => {
    const baseStyle = [
      styles.card,
      styles[`${padding}Padding`],
      styles[`${borderRadius}Radius`],
    ];

    if (variant === 'glass') {
      return [...baseStyle, styles.glassCard];
    } else if (variant === 'gradient') {
      return [...baseStyle, styles.gradientCard];
    } else if (variant === 'elevated') {
      return [...baseStyle, styles.elevatedCard];
    }

    return [...baseStyle, styles.defaultCard];
  };

  if (variant === 'gradient') {
    return (
      <TouchableOpacity {...props} style={[getCardStyle(), style]} activeOpacity={0.9}>
        <LinearGradient
          colors={Colors.primary.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, styles[`${padding}Padding`], styles[`${borderRadius}Radius`]]}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (variant === 'glass') {
    return (
      <TouchableOpacity {...props} style={[getCardStyle(), style]} activeOpacity={0.9}>
        <View style={[styles.glassOverlay, styles[`${padding}Padding`], styles[`${borderRadius}Radius`]]}>
          {children}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity {...props} style={[getCardStyle(), style]} activeOpacity={0.9}>
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  // Variants
  defaultCard: {
    backgroundColor: Colors.background.card,
  },
  glassCard: {
    backgroundColor: Colors.background.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradientCard: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  elevatedCard: {
    backgroundColor: Colors.background.card,
    elevation: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  // Padding variants
  nonePadding: {
    padding: 0,
  },
  smallPadding: {
    padding: 12,
  },
  mediumPadding: {
    padding: 16,
  },
  largePadding: {
    padding: 24,
  },
  // Border radius variants
  smallRadius: {
    borderRadius: 8,
  },
  mediumRadius: {
    borderRadius: 16,
  },
  largeRadius: {
    borderRadius: 24,
  },
  xlRadius: {
    borderRadius: 32,
  },
  // Special styles
  gradient: {
    backgroundColor: 'transparent',
  },
  glassOverlay: {
    backgroundColor: Colors.background.glass,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
