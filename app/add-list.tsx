import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';

export default function AddListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories } = useAchievementsContext();
  const { createList } = useListsContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id ?? 'other');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    setError(null);

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await createList(title.trim(), description.trim() || undefined, selectedCategoryId);
      console.log('List created successfully');
      setIsSaving(false);
      router.back();
    } catch (e) {
      console.error('Error creating list:', e);
      setError('리스트 생성 중 오류가 발생했어요.');
      setIsSaving(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} onPress={() => router.back()} activeOpacity={1} />

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>새 리스트 추가</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <IconSymbol name="xmark" size={18} color="#718096" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>리스트 제목</Text>
            <TextInput
              style={styles.textInput}
              placeholder="예: 타임즈 선정 100권의 책"
              placeholderTextColor="#4A5568"
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              autoFocus
              multiline={false}
            />
            <Text style={styles.inputHint}>리스트의 이름을 입력해주세요</Text>
          </View>

          {/* Description Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>설명 (선택사항)</Text>
            <TextInput
              style={[styles.textInput, styles.descriptionInput]}
              placeholder="예: 읽어야 할 책들의 목록"
              placeholderTextColor="#4A5568"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={200}
            />
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Error */}
          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Category selection */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>카테고리 선택</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      isSelected && {
                        borderColor: cat.color,
                        backgroundColor: `${cat.color}25`,
                      },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryChipName,
                        isSelected && { color: cat.color, fontWeight: '700' },
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isSelected && (
                      <IconSymbol name="checkmark.circle.fill" size={14} color={cat.color} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoSection}>
            <IconSymbol name="info.circle.fill" size={16} color="#718096" />
            <Text style={styles.infoText}>리스트를 생성한 후 항목을 추가할 수 있습니다</Text>
          </View>
        </ScrollView>

        {/* Save button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!title.trim() || isSaving) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim() || isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#0A0E1A" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>리스트 생성하기</Text>
              <Text style={styles.saveButtonIcon}>📋</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#0D1220',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: '#1E2A3A',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#2D3748',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#E2E8F0',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  descriptionInput: {
    minHeight: 80,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 6,
    textAlign: 'right',
  },
  inputHint: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 8,
  },
  errorBanner: {
    backgroundColor: '#FC818120',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FC818140',
  },
  errorText: {
    fontSize: 13,
    color: '#FC8181',
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
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
  categoryChipEmoji: {
    fontSize: 14,
  },
  categoryChipName: {
    fontSize: 13,
    color: '#718096',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  infoText: {
    fontSize: 13,
    color: '#718096',
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: '#4ECDC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#2D3748',
    shadowOpacity: 0,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0A0E1A',
  },
  saveButtonIcon: {
    fontSize: 18,
  },
});
