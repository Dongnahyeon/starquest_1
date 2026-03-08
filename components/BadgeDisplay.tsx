import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Badge, BADGE_DEFINITIONS, BadgeType } from '@/types/badge';

interface BadgeDisplayProps {
  unlockedBadges: BadgeType[];
  size?: 'small' | 'medium' | 'large';
  onPress?: (badge: BadgeType) => void;
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
        <Text style={styles.emptyText}>아직 배지가 없어요. 리스트를 완료해보세요!</Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {unlockedBadges.map((badgeId) => {
        const badge = BADGE_DEFINITIONS[badgeId];
        return (
          <Pressable
            key={badge.id}
            style={[styles.badgeContainer, { width: badgeSize + 16, height: badgeSize + 60 }]}
            onPress={() => onPress?.(badgeId)}
          >
            <View
              style={[
                styles.badgeCircle,
                {
                  width: badgeSize,
                  height: badgeSize,
                  backgroundColor: `${badge.color}20`,
                  borderColor: badge.color,
                },
              ]}
            >
              <Text style={{ fontSize }}>{badge.emoji}</Text>
            </View>
            <Text style={styles.badgeName} numberOfLines={2}>
              {badge.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface BadgeGridProps {
  unlockedBadges: BadgeType[];
  onPress?: (badge: BadgeType) => void;
}

export function BadgeGrid({ unlockedBadges, onPress }: BadgeGridProps) {
  const allBadgeIds = Object.keys(BADGE_DEFINITIONS) as BadgeType[];

  return (
    <View style={styles.gridContainer}>
      {allBadgeIds.map((badgeId) => {
        const badge = BADGE_DEFINITIONS[badgeId];
        const isUnlocked = unlockedBadges.includes(badgeId);

        return (
          <Pressable
            key={badge.id}
            style={[styles.gridBadgeContainer, !isUnlocked && styles.gridBadgeContainerLocked]}
            onPress={() => isUnlocked && onPress?.(badgeId)}
          >
            <View
              style={[
                styles.gridBadgeCircle,
                {
                  backgroundColor: isUnlocked ? `${badge.color}20` : '#1E2A3A',
                  borderColor: isUnlocked ? badge.color : '#2D3748',
                },
              ]}
            >
              <Text style={{ fontSize: 32, opacity: isUnlocked ? 1 : 0.3 }}>{badge.emoji}</Text>
            </View>
            <Text style={[styles.gridBadgeName, !isUnlocked && styles.gridBadgeNameLocked]}>
              {badge.name}
            </Text>
            {!isUnlocked && <Text style={styles.gridBadgeLocked}>🔒</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

interface BadgeDetailModalProps {
  badge: Badge;
  isUnlocked: boolean;
}

export function BadgeDetailModal({ badge, isUnlocked }: BadgeDetailModalProps) {
  return (
    <View style={styles.detailContainer}>
      <View
        style={[
          styles.detailBadgeCircle,
          {
            backgroundColor: isUnlocked ? `${badge.color}20` : '#1E2A3A',
            borderColor: badge.color,
          },
        ]}
      >
        <Text style={{ fontSize: 64 }}>{badge.emoji}</Text>
      </View>
      <Text style={styles.detailName}>{badge.name}</Text>
      <Text style={styles.detailDescription}>{badge.description}</Text>
      {!isUnlocked && <Text style={styles.detailLocked}>아직 잠금 상태입니다</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
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
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 14,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 12,
  },
  gridBadgeContainer: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  gridBadgeContainerLocked: {
    opacity: 0.6,
  },
  gridBadgeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridBadgeName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 14,
  },
  gridBadgeNameLocked: {
    color: '#718096',
  },
  gridBadgeLocked: {
    position: 'absolute',
    top: 4,
    right: 4,
    fontSize: 16,
  },
  detailContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  detailBadgeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  detailName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  detailDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
  },
  detailLocked: {
    fontSize: 12,
    color: '#F56565',
    fontWeight: '600',
  },
});
