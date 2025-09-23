export const AnimationConfig = {
  // Durations
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 800,
  },
  
  // Délais
  delay: {
    none: 0,
    short: 100,
    medium: 200,
    long: 400,
  },
  
  // Types d'animation
  types: {
    fadeIn: 'fadeIn',
    slideUp: 'slideUp',
    slideDown: 'slideDown',
    slideLeft: 'slideLeft',
    slideRight: 'slideRight',
    scale: 'scale',
    bounce: 'bounce',
    rotate: 'rotate',
  },
  
  // Configurations de spring
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
    },
    bouncy: {
      damping: 8,
      stiffness: 200,
    },
    snappy: {
      damping: 15,
      stiffness: 150,
    },
    wobbly: {
      damping: 4,
      stiffness: 100,
    },
  },
  
  // Configurations de timing
  timing: {
    linear: 'linear',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
  },
  
  // Interpolations courantes
  interpolations: {
    opacity: {
      inputRange: [0, 1],
      outputRange: [0, 1],
    },
    scale: {
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    },
    translateY: {
      inputRange: [0, 1],
      outputRange: [50, 0],
    },
    translateX: {
      inputRange: [0, 1],
      outputRange: [-50, 0],
    },
  },
};

// Animations prédéfinies
export const PresetAnimations = {
  // Animation d'apparition d'un élément
  fadeIn: {
    duration: AnimationConfig.duration.normal,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.fadeIn,
  },
  
  // Animation de slide up
  slideUp: {
    duration: AnimationConfig.duration.normal,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.slideUp,
  },
  
  // Animation de bounce
  bounce: {
    duration: AnimationConfig.duration.slow,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.bounce,
  },
  
  // Animation de scale
  scale: {
    duration: AnimationConfig.duration.normal,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.scale,
  },
  
  // Animation de liste (éléments successifs)
  listItem: {
    duration: AnimationConfig.duration.normal,
    delay: AnimationConfig.delay.short,
    type: AnimationConfig.types.slideUp,
  },
  
  // Animation de bouton pressé
  buttonPress: {
    duration: AnimationConfig.duration.fast,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.scale,
  },
  
  // Animation de notification
  notification: {
    duration: AnimationConfig.duration.slow,
    delay: AnimationConfig.delay.none,
    type: AnimationConfig.types.slideDown,
  },
};
