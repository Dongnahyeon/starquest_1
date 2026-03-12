import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';
import { getListStarColor, getListStarGlowIntensity } from '@/types/list';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getCategoryById } = useAchievementsContext();
  const { getListById, addListItem, toggleListItem, deleteListItem, deleteList, reorderListItems, updateListItemTitle, updateListItemNote, updateListTitle } = useListsContext();

  const list = getListById(id);
  const category = list ? getCategoryById(list.categoryId) : null;

  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showItemNoteModal, setShowItemNoteModal] = useState(false);
  const [showItemDetailModal, setShowItemDetailModal] = useState(false);
  const [selectedItemNote, setSelectedItemNote] = useState('');
  const [selectedItemTitle, setSelectedItemTitle] = useState('');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [editItemText, setEditItemText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showEditListModal, setShowEditListModal] = useState(false);
  const [editListText, setEditListText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const starScale = useRef(new Animated.Value(1)).current;
  const starGlow = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (list) {
      Animated.timing(starGlow, {
        toValue: getListStarGlowIntensity(list.completionCount, list.totalCount),
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [list?.completionCount]);

  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !list) return;
    setIsAddingItem(true);

    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      await addListItem(list.id, newItemTitle.trim());
      setNewItemTitle('');
    } catch (e) {
      Alert.alert('오류', '항목 추가 중 오류가 발생했어요.');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!list) return;
    
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    try {
      await toggleListItem(list.id, itemId);
    } catch (error) {
      console.error('Toggle error:', error);
      Alert.alert('오류', '항목 완료 상태 변경에 실패했습니다.');
    }
  };
  


  const handleViewNote = (itemId: string, itemTitle: string, note: string) => {
    setShowNoteModal(false); // 완료 메모 모달 먼저 닫기
    setShowItemNoteModal(false); // 기존 메모 수정 모달 닫기
    setTimeout(() => {
      setSelectedItemId(itemId);
      setSelectedItemTitle(itemTitle);
      setSelectedItemNote(note);
      setShowItemNoteModal(true);
    }, 100); // 상태 업데이트 후 새 모달 열기
  };

  const handleViewItemDetail = (itemId: string, itemTitle: string, note: string) => {
    setShowItemNoteModal(false); // 기존 모달 닫기
    setSelectedItemId(itemId);
    setSelectedItemTitle(itemTitle);
    setSelectedItemNote(note);
    setShowItemDetailModal(true);
  };

  const handleEditNote = async () => {
    if (!list || !selectedItemId) return;
    try {
      await updateListItemNote(list.id, selectedItemId, selectedItemNote);
      setShowItemNoteModal(false);
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Update note error:', error);
      Alert.alert('오류', '메모 수정에 실패했습니다.');
    }
  };

  const handleDeleteItem = (itemId: string, itemTitle: string) => {
    Alert.alert('항목 삭제', `"${itemTitle}" 항목을 삭제할까요?`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            if (list) {
              await deleteListItem(list.id, itemId);
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            }
          } catch (error) {
            console.error('Delete error:', error);
            Alert.alert('오류', '항목 삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  const handleStartDrag = (itemId: string) => {
    setDraggedItemId(itemId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDropItem = (targetItemId: string) => {
    if (!draggedItemId || !list || draggedItemId === targetItemId) {
      setDraggedItemId(null);
      return;
    }

    const draggedIndex = list.items.findIndex(i => i.id === draggedItemId);
    const targetIndex = list.items.findIndex(i => i.id === targetItemId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      reorderListItems(list.id, draggedIndex, targetIndex);
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    setDraggedItemId(null);
  };

  const handleEditItem = (itemId: string, currentTitle: string) => {
    setEditingItemId(itemId);
    setEditItemText(currentTitle);
    setShowEditItemModal(true);
  };

  const handleSaveEditItem = async () => {
    if (!editItemText.trim() || !list || !editingItemId) return;
    try {
      await updateListItemTitle(list.id, editingItemId, editItemText.trim());
      setShowEditItemModal(false);
      setEditingItemId(null);
      setEditItemText('');
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('오류', '항목 수정에 실패했습니다.');
    }
  };

  const handleDeleteList = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (list) {
      try {
        await deleteList(list.id);
        await new Promise(resolve => setTimeout(resolve, 200));
        router.back();
      } catch (error) {
        console.error('Delete error:', error);
        Alert.alert('오류', '리스트 삭제에 실패했습니다.');
      }
    }
  };

  const handleEditListTitle = () => {
    if (list) {
      setEditListText(list.title);
      setShowEditListModal(true);
    }
  };

  const handleSaveEditListTitle = async () => {
    if (!editListText.trim() || !list) return;
    try {
      await updateListTitle(list.id, editListText.trim());
      setShowEditListModal(false);
      setEditListText('');
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('오류', '리스트명 수정에 실패했습니다.');
    }
  };

  if (!list) {
    return (
      <View style={styles.root}>
        <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <IconSymbol name="arrow.left" size={24} color="#E2E8F0" />
          </TouchableOpacity>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>리스트를 찾을 수 없어요</Text>
          </View>
        </View>
      </View>
    );
  }

  const starColor = getListStarColor(list.categoryId);
  const glowIntensity = getListStarGlowIntensity(list.completionCount, list.totalCount);
  const completionPercentage = list.totalCount > 0 ? Math.round((list.completionCount / list.totalCount) * 100) : 0;

  return (
    <View style={styles.root}>
      {/* Background */}
      <View style={styles.background}>
        <Animated.View
          style={[
            styles.bgGlow,
            {
              backgroundColor: starColor,
              opacity: Animated.multiply(starGlow, 0.08),
            },
          ]}
        />
      </View>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 100 },
        ]}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <IconSymbol name="arrow.left" size={24} color="#E2E8F0" />
              </TouchableOpacity>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={styles.deleteButton} onPress={handleEditListTitle}>
                  <IconSymbol name="pencil" size={20} color="#E2E8F0" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteList}>
                  <IconSymbol name="trash.fill" size={20} color="#E2E8F0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Category badge */}
            {category && (
              <View style={[styles.categoryBadge, { backgroundColor: `${category.color}25`, borderColor: `${category.color}50` }]}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={[styles.categoryName, { color: category.color }]}>{category.name}</Text>
              </View>
            )}

            {/* Star visualization */}
            <View style={styles.starSection}>
              {glowIntensity > 0 && (
                <>
                  <Animated.View
                    style={[
                      styles.glowRing,
                      {
                        width: 200,
                        height: 200,
                        borderRadius: 100,
                        backgroundColor: starColor,
                        opacity: Animated.multiply(starGlow, 0.08),
                        transform: [{ scale: starScale }],
                      },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.glowRing,
                      {
                        width: 140,
                        height: 140,
                        borderRadius: 70,
                        backgroundColor: starColor,
                        opacity: Animated.multiply(starGlow, 0.15),
                        transform: [{ scale: starScale }],
                      },
                    ]}
                  />
                </>
              )}
              <Animated.Text
                style={[
                  styles.starEmoji,
                  {
                    color: starColor,
                    textShadowColor: starColor,
                    textShadowRadius: glowIntensity * 30,
                    transform: [{ scale: starScale }],
                  },
                ]}
              >
                📋
              </Animated.Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{list.title}</Text>

            {/* Description */}
            {list.description && <Text style={styles.description}>{list.description}</Text>}

            {/* Progress bar */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>진행 상황</Text>
                <Text style={[styles.progressPercent, { color: starColor }]}>{completionPercentage}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${completionPercentage}%`,
                      backgroundColor: starColor,
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressCount}>
                {list.completionCount} / {list.totalCount}개 완료
              </Text>
            </View>

            {/* Add item input */}
            <View style={styles.addItemSection}>
              <View style={styles.addItemRow}>
                <TextInput
                  style={styles.addItemInput}
                  placeholder="새 항목 추가..."
                  placeholderTextColor="#4A5568"
                  value={newItemTitle}
                  onChangeText={setNewItemTitle}
                  returnKeyType="done"
                  onSubmitEditing={handleAddItem}
                  editable={!isAddingItem}
                />
                <TouchableOpacity
                  style={[
                    styles.addItemButton,
                    (!newItemTitle.trim() || isAddingItem) && styles.addItemButtonDisabled,
                  ]}
                  onPress={handleAddItem}
                >
                  {isAddingItem ? (
                    <ActivityIndicator size="small" color="#0A0E1A" />
                  ) : (
                    <IconSymbol name="plus" size={18} color="#0A0E1A" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Items title */}
            {list.items.length > 0 && (
              <Text style={styles.itemsTitle}>항목 ({list.items.length}) - 드래그로 순서 변경</Text>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.itemRow,
              draggedItemId === item.id && styles.itemRowDragging,
            ]}
            onLongPress={() => handleStartDrag(item.id)}
            onPress={() => draggedItemId && handleDropItem(item.id)}
            activeOpacity={1}
          >
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleToggleItem(item.id)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  item.completed && {
                    backgroundColor: starColor,
                    borderColor: starColor,
                  },
                ]}
              >
                {item.completed && (
                  <IconSymbol name="checkmark" size={14} color="#0A0E1A" />
                )}
              </View>
            </TouchableOpacity>

            <View
              style={styles.itemContent}
            >
              <Text style={styles.itemTitle}>
                {item.title}
              </Text>
              <Text style={styles.itemTime}>
                생성: {new Date(item.createdAt).toLocaleString('ko-KR')}
                {item.completedAt && `\n완수: ${new Date(item.completedAt).toLocaleString('ko-KR')}`}
              </Text>
              {item.note && (
                <Text style={styles.itemNote}>
                  메모: {item.note}
                </Text>
              )}
              {item.completionNote && (
                <Text style={styles.itemNote}>
                  완수 메모: {item.completionNote}
                </Text>
              )}
            </View>

            <View style={styles.itemActions} pointerEvents="box-none">
              <TouchableOpacity
                onPress={() => handleEditItem(item.id, item.title)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol name="pencil" size={16} color="#4ECDC4" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteItem(item.id, item.title)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol name="trash" size={16} color="#FC8181" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>📭</Text>
            <Text style={styles.emptyStateText}>아직 항목이 없어요</Text>
            <Text style={styles.emptyStateHint}>위에서 항목을 추가해보세요</Text>
          </View>
        }
        ListFooterComponent={
          <>
            {/* Completion message */}
            {list.isCompleted && list.totalCount > 0 && (
              <View style={[styles.completionBanner, { backgroundColor: `${starColor}20`, borderColor: `${starColor}40` }]}>
                <Text style={styles.completionEmoji}>🎉</Text>
                <Text style={[styles.completionText, { color: starColor }]}>
                  모든 항목을 완료했어요!
                </Text>
              </View>
            )}
          </>
        }
      />
      


      {/* Note View Modal - 메모 보기 */}
      {showItemNoteModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedItemTitle}</Text>
            <Text style={styles.modalSubtitle}>메모</Text>
            
            <TextInput
              style={styles.noteInput}
              placeholder="메모를 입력하세요"
              placeholderTextColor="#718096"
              value={selectedItemNote}
              onChangeText={setSelectedItemNote}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowItemNoteModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>닫기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleEditNote}
              >
                <Text style={styles.modalSaveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      

      {/* Item Detail Modal - 항목 상세 */}
      {showItemDetailModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItemTitle}</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowItemDetailModal(false);
                  setSelectedItemNote('');
                }}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalSubtitle}>메모</Text>
            
            <TextInput
              style={styles.noteInput}
              placeholder="메모를 입력하세요"
              placeholderTextColor="#718096"
              value={selectedItemNote}
              onChangeText={setSelectedItemNote}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowItemDetailModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>닫기</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={async () => {
                  if (list && selectedItemId) {
                    try {
                      await updateListItemNote(list.id, selectedItemId, selectedItemNote);
                      setShowItemDetailModal(false);
                      setSelectedItemNote('');
                      if (Platform.OS !== 'web') {
                        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                      }
                    } catch (error) {
                      Alert.alert('오류', '메모 수정에 실패했습니다.');
                    }
                  }
                }}
              >
                <Text style={styles.modalSaveButtonText}>저장</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 항목 수정 모달 - 항목명과 메모 함께 수정 */}
    {showEditItemModal && (
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.modalContentScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalTitle}>항목 수정</Text>
          
          <Text style={styles.modalSubtitle}>항목명</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="항목 이름"
            placeholderTextColor="#718096"
            value={editItemText}
            onChangeText={setEditItemText}
            maxLength={100}
          />
          
          <Text style={styles.modalSubtitle}>메모</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#718096"
            value={selectedItemNote}
            onChangeText={setSelectedItemNote}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => {
                setShowEditItemModal(false);
                setEditingItemId(null);
                setEditItemText('');
                setSelectedItemNote('');
              }}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={async () => {
                if (!editItemText.trim() || !list || !editingItemId) return;
                try {
                  // 항목명 수정
                  await updateListItemTitle(list.id, editingItemId, editItemText.trim());
                  // 메모 수정
                  await updateListItemNote(list.id, editingItemId, selectedItemNote);
                  
                  setShowEditItemModal(false);
                  setEditingItemId(null);
                  setEditItemText('');
                  setSelectedItemNote('');
                  
                  if (Platform.OS !== 'web') {
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  }
                } catch (error) {
                  console.error('Update failed:', error);
                  Alert.alert('오류', '항목 수정에 실패했습니다.');
                }
              }}
            >
              <Text style={styles.modalSaveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    )}

    {/* 리스트명 수정 모달 */}
    {showEditListModal && (
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>리스트명 수정</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="리스트 이름"
            placeholderTextColor="#718096"
            value={editListText}
            onChangeText={setEditListText}
            maxLength={100}
          />
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowEditListModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveEditListTitle}
            >
              <Text style={styles.modalSaveButtonText}>저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}



    {/* 삭제 확인 모달 */}
    {showDeleteModal && (
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>리스트 삭제</Text>
          <Text style={styles.modalMessage}>
            "{list?.title}" 리스트를 삭제할까요?{"\n"}모든 항목이 사라집니다.
          </Text>
          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowDeleteModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalSaveButton, { backgroundColor: '#FC8181' }]}
              onPress={handleConfirmDelete}
            >
              <Text style={styles.modalSaveButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    marginBottom: 24,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  starSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 20,
  },
  glowRing: {
    position: 'absolute',
  },
  starEmoji: {
    fontSize: 70,
    textShadowOffset: { width: 0, height: 0 },
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  description: {
    fontSize: 14,
    color: '#A0AEC0',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressSection: {
    backgroundColor: '#111827',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 16,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#1E2A3A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCount: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
  addItemSection: {
    marginBottom: 24,
  },
  addItemRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  addItemInput: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  addItemButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  addItemButtonDisabled: {
    backgroundColor: '#2D3748',
    shadowOpacity: 0,
  },
  itemsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#718096',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemRow: {
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
  },
  itemRowDragging: {
    backgroundColor: '#1E2A3A',
    borderColor: '#4ECDC4',
    opacity: 0.8,
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  itemTime: {
    fontSize: 11,
    color: '#718096',
    lineHeight: 16,
  },
  itemNote: {
    fontSize: 11,
    color: '#A0AEC0',
    lineHeight: 16,
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconText: {
    fontSize: 18,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteItemButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 4,
  },
  emptyStateHint: {
    fontSize: 13,
    color: '#4A5568',
  },
  completionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
  },
  completionEmoji: {
    fontSize: 20,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#718096',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#1A1F26',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    maxHeight: '80%',
  },
  modalContentScroll: {
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 16,
  },
  noteInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#E2E8F0',
    fontSize: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  noteViewBox: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    minHeight: 80,
  },
  noteViewText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2D3748',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0E1A',
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#4ECDC4',
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0E1A',
  },
  modal: {
    backgroundColor: '#1A1F26',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalInput: {
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1E2A3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#E2E8F0',
    fontSize: 15,
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalMessage: {
    fontSize: 16,
    color: '#A0AEC0',
    marginBottom: 20,
    lineHeight: 24,
  },
});
