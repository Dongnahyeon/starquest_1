import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { getStarColor, getStarGlowIntensity } from '@/types/achievement';

interface StarIconProps {
  completionCount: number;
  size?: number;
  animated?: boolean;
  style?: object;
}

export function StarIcon({ completionCount, size = 24, animated = false, style }: StarIconProps) {
  const glowAnim = useRef(new Animated.Value(getStarGlowIntensity(completionCount))).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const color = getStarColor(completionCount);
  const glowIntensity = getStarGlowIntensity(completionCount);

  useEffect(() => {
    if (animated) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.3,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: glowIntensity,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.timing(glowAnim, {
        toValue: glowIntensity,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [completionCount, animated]);

  const glowSize = size * 1.8;

  return (
    <View style={[styles.container, { width: size * 2, height: size * 2 }, style]}>
      {/* Glow effect */}
      {glowIntensity > 0 && (
        <Animated.View
          style={[
            styles.glow,
            {
              width: glowSize,
              height: glowSize,
              borderRadius: glowSize / 2,
              backgroundColor: color,
              opacity: Animated.multiply(glowAnim, 0.4),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        />
      )}
      {/* Star shape */}
      <Animated.Text
        style={[
          styles.star,
          {
            fontSize: size,
            color: color,
            textShadowColor: color,
            textShadowRadius: glowIntensity * 12,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        ★
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  star: {
    textShadowOffset: { width: 0, height: 0 },
  },
});
