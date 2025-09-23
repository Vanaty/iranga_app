import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'bounce';
  style?: ViewStyle;
  visible?: boolean;
}

export function AnimatedView({
  children,
  delay = 0,
  duration = 300,
  animation = 'fadeIn',
  style,
  visible = true,
}: AnimatedViewProps) {
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(visible ? 0 : 50);
  const scale = useSharedValue(visible ? 1 : 0.8);

  useEffect(() => {
    if (visible) {
      const animationConfig = {
        duration,
        delay,
      };

      switch (animation) {
        case 'fadeIn':
          opacity.value = withDelay(delay, withTiming(1, animationConfig));
          break;
        case 'slideUp':
          opacity.value = withDelay(delay, withTiming(1, animationConfig));
          translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 150 }));
          break;
        case 'slideDown':
          opacity.value = withDelay(delay, withTiming(1, animationConfig));
          translateY.value = withDelay(delay, withSpring(0, { damping: 15, stiffness: 150 }));
          break;
        case 'scale':
          opacity.value = withDelay(delay, withTiming(1, animationConfig));
          scale.value = withDelay(delay, withSpring(1, { damping: 15, stiffness: 150 }));
          break;
        case 'bounce':
          opacity.value = withDelay(delay, withTiming(1, animationConfig));
          scale.value = withDelay(
            delay,
            withSequence(
              withTiming(1.1, { duration: 150 }),
              withSpring(1, { damping: 8, stiffness: 200 })
            )
          );
          break;
      }
    } else {
      opacity.value = withTiming(0, { duration: duration / 2 });
      translateY.value = withTiming(50, { duration: duration / 2 });
      scale.value = withTiming(0.8, { duration: duration / 2 });
    }
  }, [visible, delay, duration, animation]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateYValue = animation === 'slideDown' ? -translateY.value : translateY.value;
    
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateYValue },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
}

// Composant pour les animations de liste
export function AnimatedListItem({
  children,
  index,
  delay = 100,
  style,
}: {
  children: React.ReactNode;
  index: number;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <AnimatedView
      animation="slideUp"
      delay={index * delay}
      style={style}
    >
      {children}
    </AnimatedView>
  );
}

// Composant pour les animations de bouton
export function AnimatedButton({
  children,
  onPress,
  style,
  disabled = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {React.cloneElement(children as React.ReactElement, {
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        onPress: disabled ? undefined : onPress,
        disabled,
      })}
    </Animated.View>
  );
}
