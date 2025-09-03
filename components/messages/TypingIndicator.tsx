import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";

interface TypingIndicatorProps {
  userName?: string;
  style?: any;
  showUserName?: boolean;
}

const TypingIndicator = ({ userName, style, showUserName = false }: TypingIndicatorProps) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const animateDot = (dot: Animated.Value, delay: number) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: -4,
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
          delay,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    // Animation d'apparition
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Animations des points
    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);

    return () => {
      dot1.stopAnimation();
      dot2.stopAnimation();
      dot3.stopAnimation();
      opacity.stopAnimation();
    };
  }, []);

  return (
    <Animated.View style={[styles.container, style, { opacity }]}>
      {showUserName && userName && (
        <Text style={styles.userName}>{userName} est en train d'écrire</Text>
      )}
      <View style={styles.bubble}>
        <View style={styles.dotsContainer}>
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ translateY: dot1 }] }
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ translateY: dot2 }] }
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { transform: [{ translateY: dot3 }] }
            ]}
          />
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userName: {
    fontSize: 12,
    color: Colors.status.typing,
    fontStyle: 'italic',
    marginRight: 8,
    fontWeight: '500',
  },
  bubble: {
    backgroundColor: Colors.status.typingBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 1,
    shadowColor: Colors.ui.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: 'center',
    height: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.status.typingDot,
    marginHorizontal: 3,
  },
});

export default TypingIndicator;
