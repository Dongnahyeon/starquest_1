import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
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
import { trpc } from '@/lib/trpc';

interface ClassifyResult {
  categoryId: string;
  categoryName: string;
  confidence: number;
  reason: string;
}

export default function AddScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, addAchievement } = useAchievementsContext();

  const [title, setTitle] = useState('');
  const [classifyResult, setClassifyResult] = useState<ClassifyResult | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifyMutation = trpc.ai.classifyAchievement.useMutation();

  const handleClassify = async () => {
    if (!title.trim()) return;
    setIsClassifying(true);
    setError(null);
    setClassifyResult(null);

    try {
      if (!categories || !Array.isArray(categories)) {
        setError('카테고리를 불러올 수 없어요.');
        return;
      }
      const result = await classifyMutation.mutateAsync({
        title: title.trim(),
        existingCategories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          emoji: c.emoji,
        })),
      });
      setClassifyResult(result);
      setSelectedCategoryId(result.categoryId);
    } catch (e) {
      // Fallback to 'other' category if AI fails
      const otherCat = (categories && Array.isArray(categories)) ? categories.find((c) => c.id === 'other') : undefined;
      if (otherCat) {
        setClassifyResult({
          categoryId: 'other',
          categoryName: otherCat.name,
          confidence: 0.5,
          reason: '기타 카테고리로 분류했어요.',
        });
        setSelectedCategoryId('other');
      }
      setError('AI 분류 중 오류가 발생했어요. 직접 카테고리를 선택해주세요.');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || isSaving) return;
    const catId = selectedCategoryId ?? 'other';
    setIsSaving(true);

    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      await addAchievement(title.trim(), catId);
      router.back();
    } catch (e) {
      setError('저장 중 오류가 발생했어요.');
      setIsSaving(false);
    }
  };

  const selectedCategory = (categories && Array.isArray(categories)) ? categories.find((c) => c.id === (selectedCategoryId ?? classifyResult?.categoryId)) : undefined;

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
          <Text style={styles.headerTitle}>새 별 추가</Text>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <IconSymbol name="xmark" size={18} color="#718096" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollViewContent}>
          {/* Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>성취 목표</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="예: 5km 달리기, 셰익스피어 읽기..."
                placeholderTextColor="#4A5568"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setClassifyResult(null);
                  setSelectedCategoryId(null);
                  setError(null);
                }}
                returnKeyType="done"
                onSubmitEditing={handleClassify}
                autoFocus
                multiline={false}
              />
              <TouchableOpacity
                style={[
                  styles.classifyButton,
                  (!title.trim() || isClassifying) && styles.classifyButtonDisabled,
                ]}
                onPress={handleClassify}
                disabled={!title.trim() || isClassifying}
                activeOpacity={0.8}
              >
                {isClassifying ? (
                  <ActivityIndicator size="small" color="#0A0E1A" />
                ) : (
                  <IconSymbol name="sparkles" size={18} color="#0A0E1A" />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              ✦ AI가 자동으로 카테고리를 분류해드려요
            </Text>
          </View>

          {/* AI Classification Result */}
          {classifyResult && (
            <View style={styles.classifyResult}>
              <View style={styles.classifyResultHeader}>
                <IconSymbol name="sparkles" size={16} color="#F5C842" />
                <Text style={styles.classifyResultTitle}>AI 분류 결과</Text>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(classifyResult.confidence * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.classifyReason}>{classifyResult.reason}</Text>
            </View>
          )}

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
              {(categories && Array.isArray(categories)) ? categories.map((cat) => {
                const isSelected = (selectedCategoryId ?? classifyResult?.categoryId) === cat.id;
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
              }) : null}
            </View>
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
              <Text style={styles.saveButtonText}>별 추가하기</Text>
              <Text style={styles.saveButtonStar}>★</Text>
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
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#718096',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  textInput: {
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
  classifyButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F5C842',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F5C842',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  classifyButtonDisabled: {
    backgroundColor: '#2D3748',
    shadowOpacity: 0,
  },
  inputHint: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 8,
  },
  classifyResult: {
    backgroundColor: '#111827',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5C84240',
  },
  classifyResultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  classifyResultTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5C842',
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#F5C84220',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  confidenceText: {
    fontSize: 11,
    color: '#F5C842',
    fontWeight: '700',
  },
  classifyReason: {
    fontSize: 13,
    color: '#A0AEC0',
    lineHeight: 20,
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5C842',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
    shadowColor: '#F5C842',
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
  saveButtonStar: {
    fontSize: 18,
    color: '#0A0E1A',
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});
