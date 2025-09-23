import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

interface ModernLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  color?: 'primary' | 'white' | 'muted';
}

export function ModernLoadingSpinner({
  size = 'medium',
  text,
  color = 'primary',
}: ModernLoadingSpinnerProps) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
    };
  });

  const getSize = () => {
    switch (size) {
      case 'small': return 24;
      case 'medium': return 40;
      case 'large': return 60;
      default: return 40;
    }
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary': return Colors.text.primary;
      case 'white': return Colors.text.white;
      case 'muted': return Colors.text.muted;
      default: return Colors.text.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinnerContainer, { width: getSize(), height: getSize() }]}>
        <LinearGradient
          colors={Colors.primary.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.spinner, { width: getSize(), height: getSize() }]}
        >
          <Animated.View style={[animatedStyle, styles.innerSpinner]} />
        </LinearGradient>
      </Animated.View>
      {text && (
        <Text style={[styles.text, { color: getTextColor() }]}>
          {text}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerContainer: {
    position: 'relative',
  },
  spinner: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSpinner: {
    width: '60%',
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 50,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
