import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react-native';

interface ModernToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  visible: boolean;
  duration?: number;
  onHide: () => void;
}

export function ModernToast({
  message,
  type = 'info',
  visible,
  duration = 3000,
  onHide,
}: ModernToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });

      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0.8, { duration: 300 });
    
    setTimeout(() => {
      onHide();
    }, 300);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} color={Colors.text.white} />;
      case 'error':
        return <XCircle size={24} color={Colors.text.white} />;
      case 'warning':
        return <AlertCircle size={24} color={Colors.text.white} />;
      case 'info':
      default:
        return <Info size={24} color={Colors.text.white} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return ['#10B981', '#059669'];
      case 'error':
        return ['#EF4444', '#DC2626'];
      case 'warning':
        return ['#F59E0B', '#D97706'];
      case 'info':
      default:
        return Colors.primary.gradient as [string, string];
    }
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <LinearGradient
        colors={getColors() as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.toast}
      >
        <View style={styles.content}>
          {getIcon()}
          <Text style={styles.message}>{message}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  toast: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: Colors.text.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
});
