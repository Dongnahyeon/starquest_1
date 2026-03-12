import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Badge, ALL_BADGES, BADGE_MAP } from '@/types/badge';

interface BadgeDisplayProps {
  unlockedBadges: Badge[];
  size?: 'small' | 'medium' | 'large';
  onPress?: (badge: Badge) => void;
}

export function BadgeDisplay({ unlockedBadges, size = 'medium', onPress }: BadgeDisplayProps) {
  const sizeMap = {
    small: 48,
    medium: 64,
    large: 80,
  };

  const badgeSize = sizeMap[size];
  const fontSize = size === 'small' ? 20 : size === 'medium' ? 28 : 36;

  if (unlockedBadges.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>아직 배지가 없어요. 계속 활동해보세요!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {unlockedBadges.map((badge) => (
        <Pressable
          key={badge.id}
          style={[styles.badgeContainer, { width: badgeSize + 16, height: badgeSize + 60 }]}
          onPress={() => onPress?.(badge)}
        >
          <View
            style={[
              styles.badgeCircle,
              {
                width: badgeSize,
                height: badgeSize,
                backgroundColor: '#2D3748',
                borderColor: '#4ECDC4',
              },
            ]}
          >
            <Text style={[styles.badgeEmoji, { fontSize }]}>{badge.emoji}</Text>
          </View>
          <Text style={[styles.badgeName, { fontSize: size === 'small' ? 10 : 12 }]} numberOfLines={2}>
            {badge.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
  },
  badgeContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  badgeCircle: {
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeEmoji: {
    fontWeight: 'bold',
  },
  badgeName: {
    textAlign: 'center',
    color: '#E2E8F0',
    fontWeight: '500',
  },
  emptyContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyText: {
    color: '#A0AEC0',
    fontSize: 12,
  },
});
