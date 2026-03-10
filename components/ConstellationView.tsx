import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { Achievement, Category, getStarColor, getStarGlowIntensity } from '@/types/achievement';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEW_HEIGHT = 380;
const PADDING = 40;

interface StarPosition {
  x: number;
  y: number;
  achievement: Achievement;
}

function generateConstellationPositions(achievements: Achievement[]): StarPosition[] {
  if (achievements.length === 0) return [];

  const positions: StarPosition[] = [];
  const usableWidth = SCREEN_WIDTH - PADDING * 2;
  const usableHeight = VIEW_HEIGHT - PADDING * 2;

  // Create a grid-based layout with some randomness
  const cols = Math.ceil(Math.sqrt(achievements.length * 1.5));
  const rows = Math.ceil(achievements.length / cols);
  const cellW = usableWidth / cols;
  const cellH = usableHeight / rows;

  achievements.forEach((achievement, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Add some organic variation
    const jitterX = (Math.sin(i * 2.3) * cellW * 0.3);
    const jitterY = (Math.cos(i * 1.7) * cellH * 0.3);
    positions.push({
      x: PADDING + col * cellW + cellW / 2 + jitterX,
      y: PADDING + row * cellH + cellH / 2 + jitterY,
      achievement,
    });
  });

  return positions;
}

interface ConstellationViewProps {
  category: Category;
  achievements: Achievement[];
  onStarPress?: (achievement: Achievement) => void;
}

export function ConstellationView({ category, achievements, onStarPress }: ConstellationViewProps) {
  const router = useRouter();
  const positions = useMemo(
    () => generateConstellationPositions(achievements),
    [achievements]
  );

  const handleStarPress = (achievement: Achievement) => {
    if (onStarPress) {
      onStarPress(achievement);
    } else {
      router.push(`/detail/${achievement.id}` as any);
    }
  };

  if (achievements.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>별이 없습니다</Text>
        <Text style={styles.emptySubtext}>성취를 추가하면 별이 나타납니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={SCREEN_WIDTH} height={VIEW_HEIGHT} style={styles.svg}>
        {/* Constellation lines connecting adjacent stars */}
        {positions.map((pos, i) => {
          if (i === 0) return null;
          const prev = positions[i - 1];
          return (
            <Line
              key={`line-${i}`}
              x1={prev.x}
              y1={prev.y}
              x2={pos.x}
              y2={pos.y}
              stroke="#1E2A3A"
              strokeWidth={1}
              strokeDasharray="4,6"
              opacity={0.6}
            />
          );
        })}

        {/* Stars (glow circles) */}
        {positions.map((pos) => {
          const glowIntensity = getStarGlowIntensity(pos.achievement.completionCount);
          const starColor = getStarColor(pos.achievement.completionCount);
          // 별 크기를 개수에 따라 동적으로 변경 (6~16)
          const baseSize = Math.min(16, Math.max(6, 6 + (pos.achievement.completionCount * 0.5)));
          const glowSize = baseSize + glowIntensity * 12;

          return (
            <React.Fragment key={pos.achievement.id}>
              {glowIntensity > 0 && (
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={glowSize}
                  fill={starColor}
                  opacity={glowIntensity * 0.25}
                />
              )}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={baseSize}
                fill={starColor}
                opacity={0.9}
              />
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Touchable overlays for stars */}
      {positions.map((pos) => (
        <TouchableOpacity
          key={`touch-${pos.achievement.id}`}
          style={[
            styles.starTouchable,
            {
              left: pos.x - 22,
              top: pos.y - 22,
            },
          ]}
          onPress={() => handleStarPress(pos.achievement)}
          activeOpacity={0.7}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: VIEW_HEIGHT,
    position: 'relative',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  starTouchable: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  emptyContainer: {
    width: SCREEN_WIDTH,
    height: VIEW_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#2D3748',
    fontSize: 13,
    marginTop: 6,
  },
});
