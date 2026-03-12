import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useAchievements } from '@/hooks/use-achievements';
import { ScreenContainer } from '@/components/screen-container';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useColors } from '@/hooks/use-colors';

const EMOJI_OPTIONS = [
  '🏃', '📚', '🎮', '🎨', '🎵', '💪', '🧘', '🍎', '🌙', '⚡',
  '🎯', '🏆', '📝', '🚀', '💡', '🌟', '❤️', '🔥', '💎', '🌈',
  '🎭', '🎪', '🎬', '🎤', '🎸', '🎹', '🎺', '🎻', '🥁', '🎲',
  '🧩', '🎳', '🏀', '⚽', '🏈', '⚾', '🎾', '🏐', '🏉', '🥊',
];

const COLOR_OPTIONS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#A9DFBF',
];

export default function CategoriesScreen() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAchievements();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎯',
    color: '#FF6B6B',
  });
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const handleOpenModal = useCallback((categoryId?: string) => {
    if (categoryId) {
      const category = categories.find((c) => c.id === categoryId);
      if (category) {
        setFormData({
          name: category.name,
          emoji: category.emoji,
          color: category.color,
        });
        setEditingId(categoryId);
      }
    } else {
      setFormData({
        name: '',
        emoji: '🎯',
        color: '#FF6B6B',
      });
      setEditingId(null);
    }
    setModalVisible(true);
  }, [categories]);

  const handleSaveCategory = useCallback(() => {
    if (!formData.name.trim()) {
      Alert.alert('오류', '카테고리 이름을 입력해주세요.');
      return;
    }

    if (editingId) {
      updateCategory(editingId, formData.name, formData.emoji, formData.color);
      Alert.alert('성공', '카테고리가 수정되었습니다.');
    } else {
      addCategory(formData.name, formData.emoji, formData.color);
      Alert.alert('성공', '새 카테고리가 생성되었습니다.');
    }

    setModalVisible(false);
  }, [formData, editingId, addCategory, updateCategory]);

  const handleDeleteCategory = useCallback((categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    Alert.alert(
      '카테고리 삭제',
      `"${category?.name}" 카테고리를 삭제하시겠습니까?`,
      [
        { text: '취소', onPress: () => {} },
        {
          text: '삭제',
          onPress: () => {
            deleteCategory(categoryId);
            Alert.alert('성공', '카테고리가 삭제되었습니다.');
          },
          style: 'destructive',
        },
      ]
    );
  }, [categories, deleteCategory]);

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">카테고리</Text>
          <Text className="text-sm text-muted mt-1">
            성취를 분류할 카테고리를 관리합니다
          </Text>
        </View>

        {/* Category List */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {categories.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Text className="text-muted text-center">
                아직 카테고리가 없습니다.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {categories.map((category) => (
                <View
                  key={category.id}
                  className="flex-row items-center justify-between p-4 rounded-lg border border-border bg-surface"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <Text className="text-3xl">{category.emoji}</Text>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {category.name}
                      </Text>
                      <View
                        className="w-8 h-4 rounded-full mt-1"
                        style={{ backgroundColor: category.color }}
                      />
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleOpenModal(category.id)}
                      style={{ padding: 8 }}
                    >
                      <MaterialIcons name="edit" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteCategory(category.id)}
                      style={{ padding: 8 }}
                    >
                      <MaterialIcons name="delete" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Add Category Button */}
        <View className="px-4 py-4 border-t border-border">
          <TouchableOpacity
            onPress={() => handleOpenModal()}
            className="bg-primary rounded-lg py-3 items-center"
          >
            <Text className="text-white font-semibold text-base">
              새 카테고리 추가
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50">
          <View
            className="flex-1 bg-background rounded-t-3xl mt-auto"
            style={{ maxHeight: '90%' }}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Text className="text-lg font-bold text-foreground">
                {editingId ? '카테고리 수정' : '새 카테고리'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView
              className="flex-1 px-4 py-4"
              showsVerticalScrollIndicator={false}
            >
              {/* Name Input */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  카테고리 이름
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="예: 운동, 독서, 코딩"
                  placeholderTextColor={colors.muted}
                  className="border border-border rounded-lg px-3 py-2 text-foreground"
                  style={{
                    color: colors.foreground,
                    borderColor: colors.border,
                  }}
                />
              </View>

              {/* Emoji Picker */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  이모지
                </Text>
                <TouchableOpacity
                  onPress={() => setEmojiPickerVisible(!emojiPickerVisible)}
                  className="border border-border rounded-lg px-3 py-3 flex-row items-center justify-between"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="text-2xl">{formData.emoji}</Text>
                  <MaterialIcons
                    name={emojiPickerVisible ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>

                {emojiPickerVisible && (
                  <View className="mt-2 p-3 bg-surface rounded-lg border border-border">
                    <FlatList
                      data={EMOJI_OPTIONS}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => {
                            setFormData((prev) => ({ ...prev, emoji: item }));
                            setEmojiPickerVisible(false);
                          }}
                          style={{ padding: 8, flex: 1 / 5 }}
                        >
                          <Text className="text-2xl text-center">{item}</Text>
                        </Pressable>
                      )}
                      keyExtractor={(item) => item}
                      numColumns={5}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </View>

              {/* Color Picker */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">
                  색상
                </Text>
                <TouchableOpacity
                  onPress={() => setColorPickerVisible(!colorPickerVisible)}
                  className="border border-border rounded-lg px-3 py-3 flex-row items-center justify-between"
                  style={{ borderColor: colors.border }}
                >
                  <View
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: formData.color }}
                  />
                  <MaterialIcons
                    name={colorPickerVisible ? 'expand-less' : 'expand-more'}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>

                {colorPickerVisible && (
                  <View className="mt-2 p-3 bg-surface rounded-lg border border-border">
                    <FlatList
                      data={COLOR_OPTIONS}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => {
                            setFormData((prev) => ({ ...prev, color: item }));
                            setColorPickerVisible(false);
                          }}
                          style={{ padding: 8, flex: 1 / 5 }}
                        >
                          <View
                            className="w-10 h-10 rounded-full border-2"
                            style={{
                              backgroundColor: item,
                              borderColor:
                                formData.color === item
                                  ? colors.foreground
                                  : 'transparent',
                            }}
                          />
                        </Pressable>
                      )}
                      keyExtractor={(item) => item}
                      numColumns={5}
                      scrollEnabled={false}
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Modal Footer */}
            <View className="px-4 py-4 border-t border-border gap-2">
              <TouchableOpacity
                onPress={handleSaveCategory}
                className="bg-primary rounded-lg py-3 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  {editingId ? '수정 완료' : '카테고리 생성'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="border border-border rounded-lg py-3 items-center"
                style={{ borderColor: colors.border }}
              >
                <Text className="text-foreground font-semibold text-base">
                  취소
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
