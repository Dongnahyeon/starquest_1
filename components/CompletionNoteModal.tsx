import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface CompletionNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (note: string) => void;
  achievementTitle: string;
  starColor: string;
}

export function CompletionNoteModal({
  visible,
  onClose,
  onSubmit,
  achievementTitle,
  starColor,
}: CompletionNoteModalProps) {
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    onSubmit(note);
    setNote('');
  };

  const handleClose = () => {
    setNote('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>완료 메모</Text>
            <TouchableOpacity onPress={handleClose}>
              <IconSymbol name="xmark" size={24} color="#718096" />
            </TouchableOpacity>
          </View>

          {/* Achievement title */}
          <Text style={styles.achievementTitle} numberOfLines={2}>
            {achievementTitle}
          </Text>

          {/* Input field */}
          <TextInput
            style={styles.input}
            placeholder="이 완료에 대한 메모를 작성해주세요 (선택사항)"
            placeholderTextColor="#4A5568"
            multiline
            maxLength={200}
            value={note}
            onChangeText={setNote}
            returnKeyType="done"
          />

          {/* Character count */}
          <Text style={styles.charCount}>{note.length}/200</Text>

          {/* Action buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: starColor }]}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>완료 저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A0AEC0',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#0A0E1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#E2E8F0',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'right',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    backgroundColor: '#0A0E1A',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0E1A',
  },
});
