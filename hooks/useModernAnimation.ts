import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { AnimationConfig, PresetAnimations } from '@/constants/Animations';

interface UseModernAnimationProps {
  visible?: boolean;
  animation?: keyof typeof PresetAnimations;
  delay?: number;
  duration?: number;
  type?: string;
}

export function useModernAnimation({
  visible = true,
  animation = 'fadeIn',
  delay = 0,
  duration,
  type,
}: UseModernAnimationProps = {}) {
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(visible ? 0 : 50);
  const translateX = useSharedValue(visible ? 0 : -50);
  const scale = useSharedValue(visible ? 1 : 0.8);
  const rotation = useSharedValue(0);

  const config = PresetAnimations[animation];
  const finalDuration = duration || config.duration;
  const finalDelay = delay || config.delay;
  const finalType = type || config.type;

  useEffect(() => {
    if (visible) {
      const springConfig = AnimationConfig.spring.snappy;
      
      switch (finalType) {
        case 'fadeIn':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          break;
          
        case 'slideUp':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          translateY.value = withDelay(finalDelay, withSpring(0, springConfig));
          break;
          
        case 'slideDown':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          translateY.value = withDelay(finalDelay, withSpring(0, springConfig));
          break;
          
        case 'slideLeft':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          translateX.value = withDelay(finalDelay, withSpring(0, springConfig));
          break;
          
        case 'slideRight':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          translateX.value = withDelay(finalDelay, withSpring(0, springConfig));
          break;
          
        case 'scale':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          scale.value = withDelay(finalDelay, withSpring(1, springConfig));
          break;
          
        case 'bounce':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          scale.value = withDelay(
            finalDelay,
            withSequence(
              withTiming(1.2, { duration: finalDuration / 2 }),
              withSpring(1, { damping: 8, stiffness: 200 })
            )
          );
          break;
          
        case 'rotate':
          opacity.value = withDelay(finalDelay, withTiming(1, { duration: finalDuration }));
          rotation.value = withDelay(finalDelay, withSpring(360, springConfig));
          break;
      }
    } else {
      opacity.value = withTiming(0, { duration: finalDuration / 2 });
      translateY.value = withTiming(50, { duration: finalDuration / 2 });
      translateX.value = withTiming(-50, { duration: finalDuration / 2 });
      scale.value = withTiming(0.8, { duration: finalDuration / 2 });
    }
  }, [visible, finalDelay, finalDuration, finalType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return {
    animatedStyle,
    opacity,
    translateY,
    translateX,
    scale,
    rotation,
  };
}

// Hook pour les animations de liste
export function useListAnimation(itemIndex: number, delay = 100) {
  return useModernAnimation({
    animation: 'slideUp',
    delay: itemIndex * delay,
  });
}

// Hook pour les animations de bouton
export function useButtonAnimation() {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const pressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const pressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };

  const press = () => {
    scale.value = withSequence(
      withSpring(0.9, { damping: 15, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
  };

  return {
    animatedStyle,
    pressIn,
    pressOut,
    press,
  };
}
