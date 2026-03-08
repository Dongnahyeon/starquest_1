import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StarData {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  delay: number;
}

interface StarryIntroProps {
  onFinish: () => void;
}

function generateStars(count: number): StarData[] {
  const stars: StarData[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT * 0.85,
      size: Math.random() * 3 + 1,
      opacity: new Animated.Value(0),
      delay: Math.random() * 1500,
    });
  }
  return stars;
}

export function StarryIntro({ onFinish }: StarryIntroProps) {
  const stars = useMemo(() => generateStars(80), []);
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate stars appearing
    const starAnimations = stars.map((star) =>
      Animated.sequence([
        Animated.delay(star.delay),
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.7 + 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    // Title fade in after 800ms
    const titleAnim = Animated.sequence([
      Animated.delay(800),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    // Subtitle fade in after 1400ms
    const subtitleAnim = Animated.sequence([
      Animated.delay(1400),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    // Fade out everything after 3200ms
    const fadeOut = Animated.sequence([
      Animated.delay(3200),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([
      ...starAnimations,
      titleAnim,
      subtitleAnim,
      fadeOut,
    ]).start(() => {
      onFinish();
    });
  }, []);

  // Twinkling animation for some stars
  useEffect(() => {
    const twinkleStars = stars.filter((_, i) => i % 3 === 0);
    const twinkleAnimations = twinkleStars.map((star) => {
      const twinkle = Animated.loop(
        Animated.sequence([
          Animated.delay(Math.random() * 1000 + 500),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.7 + 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      return twinkle;
    });
    twinkleAnimations.forEach((anim) => anim.start());
    return () => twinkleAnimations.forEach((anim) => anim.stop());
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
      {/* Stars */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={[
            styles.star,
            {
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
              opacity: star.opacity,
              shadowRadius: star.size > 2.5 ? 4 : 2,
            },
          ]}
        />
      ))}

      {/* Nebula glow effects */}
      <View style={[styles.nebula, styles.nebula1]} />
      <View style={[styles.nebula, styles.nebula2]} />

      {/* Title */}
      <View style={styles.titleContainer}>
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          ✦ StarQuest ✦
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          별자리로 이루는 나의 성취
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0A0E1A',
    zIndex: 999,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    elevation: 2,
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.06,
  },
  nebula1: {
    width: 300,
    height: 300,
    backgroundColor: '#553C9A',
    top: SCREEN_HEIGHT * 0.1,
    left: -80,
  },
  nebula2: {
    width: 250,
    height: 250,
    backgroundColor: '#2B6CB0',
    bottom: SCREEN_HEIGHT * 0.15,
    right: -60,
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F5C842',
    letterSpacing: 2,
    textShadowColor: '#F5C842',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#A0AEC0',
    letterSpacing: 1,
  },
});
