import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  Modal,
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StarIcon } from '@/components/StarIcon';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { Achievement, Category, getStarDynamicName } from '@/types/achievement';
import { ScreenContainer } from '@/components/screen-container';

export default function ListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements, categories, completeAchievement, deleteAchievement, reorderAchievements, updateAchievementTitle } = useAchievementsContext();
  const { lists, deleteList, reorderLists } = useListsContext();
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'lists'>('achievements');
  const [selectedListCategoryId, setSelectedListCategoryId] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [editText, setEditText] = useState('');
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editingList, setEditingList] = useState<{ id: string; title: string } | null>(null);
  const [editListText, setEditListText] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    emoji: '🎯',
    color: '#FF6B6B',
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const { addCategory, updateCategory, deleteCategory } = useAchievementsContext();

  const filteredAchievements = selectedListCategoryId === null || selectedListCategoryId === 'all'
    ? (achievements && Array.isArray(achievements) ? achievements : [])
    : (achievements && Array.isArray(achievements) ? achievements.filter((a) => a.categoryId === selectedListCategoryId) : []);

  // Filter lists by category
  const filteredLists = selectedListCategoryId === null || selectedListCategoryId === 'all'
    ? lists
    : lists.filter((list) => list.categoryId === selectedListCategoryId);

  // Calculate category counts for achievements
  const achievementCategoryCounts = (categories && Array.isArray(categories)) ?
    categories.reduce((acc, cat) => {
      const count = (achievements && Array.isArray(achievements)) ?
        achievements.filter((a) => a.categoryId === cat.id).length : 0;
      acc[cat.id] = count;
      return acc;
    }, {} as Record<string, number>) : {};

  const handleComplete = async (achievement: Achievement) => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setJustCompleted(achievement.id);
    await completeAchievement(achievement.id);
    setTimeout(() => setJustCompleted(null), 800);
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setEditText(achievement.title);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingAchievement || !editText.trim()) return;
    try {
      await updateAchievementTitle(editingAchievement.id, editText.trim());
      setShowEditModal(false);
      setEditingAchievement(null);
      setEditText('');
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('오류', '별 수정에 실패했습니다.');
    }
  };

  const handleDelete = (achievement: Achievement) => {
    console.log('[LOG] handleDelete 호출:', achievement.title);
    Alert.alert(
      '별 삭제',
      `"${achievement.title}" 별을 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('[LOG] 삭제 버튼 클릭:', achievement.id);
              await deleteAchievement(achievement.id);
              console.log('[LOG] deleteAchievement 완료');
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('오류', '별 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteList = (listId: string, listTitle: string) => {
    Alert.alert(
      '리스트 삭제',
      `"${listTitle}" 리스트를 삭제할까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteList(listId);
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('오류', '리스트 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  };
  const handleEditListTitle = async (listId: string, currentTitle: string) => {
    setEditingList({ id: listId, title: currentTitle });
    setEditListText(currentTitle);
    setShowEditListModal(true);
  };


  const handleMoveAchievementUp = async (index: number) => {
    if (index > 0) {
      await reorderAchievements(index, index - 1);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleMoveAchievementDown = async (index: number) => {
    if (filteredAchievements && Array.isArray(filteredAchievements) && index < filteredAchievements.length - 1) {
      await reorderAchievements(index, index + 1);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleMoveListUp = async (index: number) => {
    if (index > 0) {
      await reorderLists(index, index - 1);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleMoveListDown = async (index: number) => {
    if (index < lists.length - 1) {
      await reorderLists(index, index + 1);
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const renderAchievementItem = ({ item, index }: { item: Achievement; index: number }) => {
    const isJustCompleted = justCompleted === item.id;
    const category = (categories && Array.isArray(categories)) ? categories.find((c) => c.id === item.categoryId) : undefined;
    const achievementIndex = (filteredAchievements && Array.isArray(filteredAchievements)) ? filteredAchievements.findIndex((a) => a.id === item.id) : -1;
    
    // Calculate star size based on category's achievement count
    const categoryAchievements = filteredAchievements.filter((a) => a.categoryId === item.categoryId);
    const achievementCountInCategory = categoryAchievements.length;
    let starSize = 14; // default
    if (achievementCountInCategory >= 25) {
      starSize = 6;
    } else if (achievementCountInCategory >= 16) {
      starSize = 8;
    } else if (achievementCountInCategory >= 10) {
      starSize = 10;
    } else if (achievementCountInCategory >= 6) {
      starSize = 12;
    }

    return (
      <TouchableOpacity
        style={styles.achievementCard}
        onPress={() => router.push(`/detail/${item.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.achievementLeft}>
          <StarIcon
            completionCount={item.completionCount}
            size={starSize}
            animated={isJustCompleted}
          />
        </View>
        <View style={styles.achievementContent}>
          <Text style={styles.achievementTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.achievementCategory}>{category?.emoji} {category?.name}</Text>
        </View>
        <View style={styles.achievementRight}>
          <Text style={styles.achievementCount}>{item.completionCount}회</Text>
          <TouchableOpacity
            onPress={() => handleMoveAchievementUp(achievementIndex)}
            disabled={achievementIndex === 0}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="chevron.up" size={16} color={achievementIndex === 0 ? '#475569' : '#718096'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMoveAchievementDown(achievementIndex)}
            disabled={achievementIndex === filteredAchievements.length - 1}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="chevron.down" size={16} color={achievementIndex === filteredAchievements.length - 1 ? '#475569' : '#718096'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEditAchievement(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="pencil" size={16} color="#718096" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleComplete(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="checkmark.circle" size={18} color={item.completionCount > 0 ? '#22C55E' : '#718096'} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListItem = ({ item, index }: { item: any; index: number }) => {
    const completionPercent = item.totalCount > 0 ? Math.round((item.completionCount / item.totalCount) * 100) : 0;

    return (
      <View style={styles.listCardContainer}>
        <TouchableOpacity
          style={styles.listCard}
          onPress={() => router.push(`/list/${item.id}` as any)}
          activeOpacity={0.7}
        >
          <View style={styles.listCardHeader}>
            <Text style={styles.listCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
          <View style={styles.listCardProgress}>
            <View style={styles.listCardProgressBg}>
              <View
                style={[
                  styles.listCardProgressFill,
                  { width: `${completionPercent}%`, backgroundColor: item.isCompleted ? '#22C55E' : '#4ECDC4' },
                ]}
              />
            </View>
            <Text style={styles.listCardProgressText}>
              {item.completionCount}/{item.totalCount}
            </Text>
          </View>
          {item.isCompleted && (
            <View style={styles.completedBadge}>
              <Text style={styles.completedBadgeText}>✓ 완료</Text>
            </View>
          )}
        </TouchableOpacity>
        <View style={styles.listCardActions}>
          <TouchableOpacity
            onPress={() => handleMoveListUp(index)}
            disabled={index === 0}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="chevron.up" size={16} color={index === 0 ? '#475569' : '#718096'} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleMoveListDown(index)}
            disabled={index === lists.length - 1}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol name="chevron.down" size={16} color={index === lists.length - 1 ? '#475569' : '#718096'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {selectedTab === 'achievements' ? (
        <FlatList
          key="achievements-list"
          data={filteredAchievements}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderAchievementItem({ item, index })}
          scrollEnabled={true}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 },
          ]}
          ListHeaderComponent={
            <>
              {/* Tab selector */}
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  style={[styles.tab, (selectedTab as any) === 'achievements' && styles.tabActive]}
                  onPress={() => setSelectedTab('achievements')}
                >
                  <IconSymbol name="sparkles" size={18} color={(selectedTab as any) === 'achievements' ? '#F5C842' : '#718096'} />
                  <Text style={[styles.tabText, (selectedTab as any) === 'achievements' && styles.tabTextActive]}>
                    별 목록
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, (selectedTab as any) === 'lists' && styles.tabActive]}
                  onPress={() => setSelectedTab('lists')}
                >
                  <IconSymbol name="list.bullet" size={18} color={(selectedTab as any) === 'lists' ? '#F5C842' : '#718096'} />
                  <Text style={[styles.tabText, (selectedTab as any) === 'lists' && styles.tabTextActive]}>
                    리스트
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryManageButton}
                  onPress={() => setShowCategoryModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconSymbol name="tag.fill" size={18} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Category filter */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryBadge,
                    (selectedListCategoryId === null || selectedListCategoryId === 'all') && styles.categoryBadgeActive,
                  ]}
                  onPress={() => setSelectedListCategoryId(null)}
                >
                  <Text style={[styles.categoryBadgeText, (selectedListCategoryId === null || selectedListCategoryId === 'all') && styles.categoryBadgeTextActive]}>
                    전체
                  </Text>
                </TouchableOpacity>
                {categories && Array.isArray(categories) && categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryBadge,
                      selectedListCategoryId === cat.id && { backgroundColor: cat.color, borderColor: cat.color },
                    ]}
                    onPress={() => setSelectedListCategoryId(cat.id)}
                  >
                    <Text style={[styles.categoryBadgeText, selectedListCategoryId === cat.id && styles.categoryBadgeTextActive]}>
                      {cat.emoji} {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>✨</Text>
              <Text style={styles.emptyStateTitle}>별이 없어요</Text>
              <Text style={styles.emptyStateSubtitle}>새로운 성취 목표를 추가해보세요</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key="lists-grid"
          data={filteredLists}
          keyExtractor={(item) => item.id}
          renderItem={renderListItem}
          scrollEnabled={true}
          numColumns={2}
          columnWrapperStyle={styles.listGrid}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 80 },
          ]}
          ListHeaderComponent={
            <>
              {/* Tab selector */}
              <View style={styles.tabSelector}>
                <TouchableOpacity
                  style={[styles.tab, (selectedTab as any) === 'achievements' && styles.tabActive]}
                  onPress={() => setSelectedTab('achievements')}
                >
                  <IconSymbol name="sparkles" size={18} color={(selectedTab as any) === 'achievements' ? '#F5C842' : '#718096'} />
                  <Text style={[styles.tabText, (selectedTab as any) === 'achievements' && styles.tabTextActive]}>
                    별 목록
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, (selectedTab as any) === 'lists' && styles.tabActive]}
                  onPress={() => setSelectedTab('lists')}
                >
                  <IconSymbol name="list.bullet" size={18} color={(selectedTab as any) === 'lists' ? '#F5C842' : '#718096'} />
                  <Text style={[styles.tabText, (selectedTab as any) === 'lists' && styles.tabTextActive]}>
                    리스트
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.categoryManageButton}
                  onPress={() => setShowCategoryModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <IconSymbol name="tag.fill" size={18} color="#718096" />
                </TouchableOpacity>
              </View>

              {/* Category filter for lists */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
                contentContainerStyle={styles.categoryScrollContent}
              >
                {/* All option */}
                <TouchableOpacity
                  style={[
                    styles.categoryBadge,
                    (selectedListCategoryId === null || selectedListCategoryId === 'all') && { backgroundColor: '#F5C842', borderColor: '#F5C842' },
                  ]}
                  onPress={() => setSelectedListCategoryId('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.categoryBadgeText,
                    (selectedListCategoryId === null || selectedListCategoryId === 'all') && styles.categoryBadgeTextActive
                  ]}>
                    전체
                  </Text>
                </TouchableOpacity>

                {/* Category options */}
                {categories && Array.isArray(categories) && categories.map((cat) => {
                  const isSelected = selectedListCategoryId === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[
                        styles.categoryBadge,
                        isSelected && {
                          backgroundColor: cat.color,
                          borderColor: cat.color,
                        },
                      ]}
                      onPress={() => setSelectedListCategoryId(cat.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.categoryBadgeText, isSelected && styles.categoryBadgeTextActive]}>
                        {cat.emoji} {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📋</Text>
              <Text style={styles.emptyStateTitle}>리스트가 없어요</Text>
              <Text style={styles.emptyStateSubtitle}>새로운 리스트를 추가해보세요</Text>
              <TouchableOpacity
                style={styles.emptyAddButton}
                onPress={() => router.push('/add-list' as any)}
              >
                <Text style={styles.emptyAddButtonText}>+ 리스트 추가</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Edit Achievement Modal */}
      {showEditModal && editingAchievement && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>별 수정</Text>
            <Text style={styles.modalSubtitle}>별의 이름을 변경하세요</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="별 이름"
              placeholderTextColor="#718096"
              value={editText}
              onChangeText={setEditText}
              autoFocus
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowEditModal(false);
                  setEditingAchievement(null);
                  setEditText('');
                }}
              >
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.modalSaveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      
      {/* Category Management Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.categoryModalOverlay}>
          <View style={styles.categoryModalContent}>
            {/* Modal Header */}
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>
                {editingCategoryId ? '카테고리 수정' : '새 카테고리'}
              </Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <IconSymbol name="xmark" size={24} color="#E2E8F0" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Category List */}
              <View style={styles.categoryListSection}>
                <Text style={styles.sectionTitle}>기존 카테고리</Text>
                {categories && Array.isArray(categories) && categories.map((cat) => (
                  <View key={cat.id} style={styles.categoryListItem}>
                    <View style={styles.categoryListItemLeft}>
                      <Text style={styles.categoryListItemEmoji}>{cat.emoji}</Text>
                      <View>
                        <Text style={styles.categoryListItemName}>{cat.name}</Text>
                        <View style={[styles.categoryColorDot, { backgroundColor: cat.color }]} />
                      </View>
                    </View>
                    <View style={styles.categoryListItemActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setCategoryFormData({
                            name: cat.name,
                            emoji: cat.emoji,
                            color: cat.color,
                          });
                          setEditingCategoryId(cat.id);
                        }}
                      >
                        <IconSymbol name="pencil" size={18} color="#F5C842" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert(
                            '카테고리 삭제',
                            `"${cat.name}" 카테고리를 삭제하시겠습니까?`,
                            [
                              { text: '취소', style: 'cancel' },
                              {
                                text: '삭제',
                                style: 'destructive',
                                onPress: () => {
                                  deleteCategory(cat.id);
                                },
                              },
                            ]
                          );
                        }}
                      >
                        <IconSymbol name="trash" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>
                  {editingCategoryId ? '카테고리 수정' : '새 카테고리 추가'}
                </Text>

                {/* Name Input */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>이름</Text>
                  <TextInput
                    style={styles.textInput}
                    value={categoryFormData.name}
                    onChangeText={(text) =>
                      setCategoryFormData((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="카테고리 이름"
                    placeholderTextColor="#718096"
                  />
                </View>

                {/* Emoji Picker */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>이모지</Text>
                  <TouchableOpacity
                    style={styles.emojiPickerButton}
                    onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}
                  >
                    <Text style={styles.emojiPickerText}>{categoryFormData.emoji}</Text>
                    <IconSymbol
                      name={emojiPickerVisible ? 'chevron.up' : 'chevron.down'}
                      size={16}
                      color="#718096"
                    />
                  </TouchableOpacity>
                  {emojiPickerVisible && (
                    <View style={styles.emojiGrid}>
                      {['🏃', '📚', '🎮', '🎨', '🎵', '💪', '🧘', '🍎', '🌙', '⚡', '🎯', '🏆', '📝', '🚀', '💡', '🌟', '❤️', '🔥', '💎', '🌈'].map((emoji) => (
                        <TouchableOpacity
                          key={emoji}
                          style={styles.emojiOption}
                          onPress={() => {
                            setCategoryFormData((prev) => ({ ...prev, emoji }));
                            setEmojiPickerVisible(false);
                          }}
                        >
                          <Text style={styles.emojiOptionText}>{emoji}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Color Picker */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>색상</Text>
                  <TouchableOpacity
                    style={styles.colorPickerButton}
                    onPress={() => setColorPickerVisible(!colorPickerVisible)}
                  >
                    <View
                      style={[styles.colorDot, { backgroundColor: categoryFormData.color }]}
                    />
                    <IconSymbol
                      name={colorPickerVisible ? 'chevron.up' : 'chevron.down'}
                      size={16}
                      color="#718096"
                    />
                  </TouchableOpacity>
                  {colorPickerVisible && (
                    <View style={styles.colorGrid}>
                      {['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF'].map((color) => (
                        <TouchableOpacity
                          key={color}
                          style={[
                            styles.colorOption,
                            { backgroundColor: color },
                            categoryFormData.color === color && styles.colorOptionSelected,
                          ]}
                          onPress={() => {
                            setCategoryFormData((prev) => ({ ...prev, color }));
                            setColorPickerVisible(false);
                          }}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  if (!categoryFormData.name.trim()) {
                    Alert.alert('오류', '카테고리 이름을 입력해주세요.');
                    return;
                  }
                  if (editingCategoryId) {
                    updateCategory(
                      editingCategoryId,
                      categoryFormData.name,
                      categoryFormData.emoji,
                      categoryFormData.color
                    );
                    setEditingCategoryId(null);
                  } else {
                    addCategory(
                      categoryFormData.name,
                      categoryFormData.emoji,
                      categoryFormData.color
                    );
                  }
                  setCategoryFormData({ name: '', emoji: '🎯', color: '#FF6B6B' });
                }}
              >
                <Text style={styles.modalButtonText}>
                  {editingCategoryId ? '수정 완료' : '카테고리 추가'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCategoryModal(false);
                  setEditingCategoryId(null);
                  setCategoryFormData({ name: '', emoji: '🎯', color: '#FF6B6B' });
                }}
              >
                <Text style={styles.modalButtonCancelText}>닫기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  tabSelector: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
  },
  tabActive: {
    backgroundColor: '#1E2A3A',
    borderWidth: 1,
    borderColor: '#F5C842',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#F5C842',
  },
  categoryManageButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryScrollContent: {
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
    gap: 5,
  },
  categoryEmoji: {
    fontSize: 14,
  },
  categoryName: {
    fontSize: 13,
    color: '#718096',
  },
  categoryBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E2A3A',
    backgroundColor: '#111827',
  },
  categoryBadgeActive: {
    backgroundColor: '#F5C842',
    borderColor: '#F5C842',
  },
  categoryBadgeText: {
    fontSize: 14,
    color: '#718096',
    fontWeight: '600',
  },
  categoryBadgeTextActive: {
    color: '#0A0E1A',
  },
  categoryGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
    marginTop: 8,
  },
  categoryGroupEmoji: {
    fontSize: 18,
  },
  categoryGroupName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  categoryGroupBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryGroupBadgeText: {
    fontSize: 10,
    color: '#0A0E1A',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 0,
  },
  listGrid: {
    gap: 12,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    gap: 10,
    marginHorizontal: 16,
  },
  achievementLeft: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  achievementCategory: {
    fontSize: 11,
    color: '#718096',
  },
  achievementSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  achievementRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  achievementCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F5C842',
    marginRight: 4,
  },
  listCardContainer: {
    flex: 0.5,
    gap: 8,
  },
  listCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  listCardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#0A0E1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  listCardTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  listCardProgress: {
    gap: 4,
  },
  listCardProgressBg: {
    height: 4,
    backgroundColor: '#1E2A3A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  listCardProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  listCardProgressText: {
    fontSize: 11,
    color: '#718096',
    textAlign: 'center',
  },
  completedBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#22C55E',
    borderRadius: 6,
    alignItems: 'center',
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 24,
  },
  emptyAddButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F5C842',
    borderRadius: 8,
  },
  emptyAddButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E2E8F0',
    marginBottom: 16,
    fontSize: 14,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F5C842',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0A0E1A',
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  categoryModalContent: {
    backgroundColor: '#0A0E1A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    flexDirection: 'column',
  },
  categoryModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E2A3A',
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E2A3A',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F5C842',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0E1A',
  },
  modalButtonCancel: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  categoryListSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  categoryListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  categoryListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  categoryListItemEmoji: {
    fontSize: 24,
  },
  categoryListItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  categoryColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryListItemActions: {
    flexDirection: 'row',
    gap: 12,
  },
  formSection: {
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#E2E8F0',
    fontSize: 14,
  },
  emojiPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  emojiPickerText: {
    fontSize: 24,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 8,
  },
  emojiOption: {
    width: '20%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  colorPickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 8,
  },
  colorOption: {
    width: '20%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
});
