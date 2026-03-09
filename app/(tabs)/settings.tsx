import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAchievementsContext } from '@/lib/achievements-context';
import { useListsContext } from '@/lib/lists-context';

interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { achievements } = useAchievementsContext();
  const { lists } = useListsContext();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showGoogleSignIn, setShowGoogleSignIn] = useState(false);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize Google Sign-In
  useEffect(() => {
    if ((window as any).google) {
      (window as any).google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });
    }
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    try {
      setIsLoading(true);
      
      // Decode JWT token
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const userData = JSON.parse(jsonPayload);
      
      setGoogleUser({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      });
      
      setIsLoggedIn(true);
      setShowGoogleSignIn(false);
      
      // Auto-sync to Google Drive
      await syncToGoogleDrive(userData);
    } catch (error) {
      console.error('Google Sign-In error:', error);
      Alert.alert('로그인 실패', '구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const syncToGoogleDrive = async (userData: any) => {
    try {
      setIsLoading(true);
      
      const dataToSync = {
        achievements,
        lists,
        syncedAt: new Date().toISOString(),
        userEmail: userData.email,
      };

      // For now, just show success message
      // Full Google Drive API integration requires backend server
      console.log('Data to sync:', dataToSync);
      
      setLastSyncTime(new Date().toLocaleString('ko-KR'));
      Alert.alert('동기화 준비 완료', 'Google Drive 연동이 설정되었습니다.\n(전체 기능은 곧 추가됩니다)');
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('동기화 실패', '데이터 동기화 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setGoogleUser(null);
    setLastSyncTime(null);
    Alert.alert('로그아웃', 'Google 계정에서 로그아웃되었습니다.');
  };

  const handleManualSync = async () => {
    if (!isLoggedIn || !googleUser) {
      Alert.alert('로그인 필요', '먼저 Google 계정으로 로그인해주세요.');
      return;
    }

    await syncToGoogleDrive(googleUser);
  };

  return (
    <View style={styles.root}>
      {/* Background */}
      <View style={styles.background}>
        <View style={[styles.nebula, styles.nebula1]} />
        <View style={[styles.nebula, styles.nebula2]} />
      </View>

      <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚙️ 설정</Text>
        </View>

        {/* Google Drive Sync Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>☁️ Google Drive 동기화</Text>

          {isLoggedIn && googleUser ? (
            <View style={styles.userCard}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{googleUser.name}</Text>
                <Text style={styles.userEmail}>{googleUser.email}</Text>
                {lastSyncTime && (
                  <Text style={styles.lastSync}>마지막 동기화: {lastSyncTime}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <IconSymbol name="xmark" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.googleSignInButton}
              onPress={() => {
                setShowGoogleSignIn(true);
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.googleSignInButtonText}>
                  Google로 로그인
                </Text>
              )}
            </TouchableOpacity>
          )}

          {isLoggedIn && (
            <TouchableOpacity
              style={styles.syncButton}
              onPress={handleManualSync}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <IconSymbol name="arrow.clockwise" size={18} color="#FFF" />
                  <Text style={styles.syncButtonText}>지금 동기화</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Data Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 데이터 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{achievements.length}</Text>
              <Text style={styles.statLabel}>별</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{lists.length}</Text>
              <Text style={styles.statLabel}>리스트</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {achievements.reduce((sum, a) => sum + a.completionCount, 0)}
              </Text>
              <Text style={styles.statLabel}>완료</Text>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ 정보</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>StarQuest v1.0.0</Text>
            <Text style={styles.infoText}>
              별자리 테마의 성취 관리 앱
            </Text>
            <Text style={styles.infoText}>
              Google Drive를 통해 여러 기기에서 데이터를 동기화할 수 있습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Google Sign-In Modal */}
      <Modal
        visible={showGoogleSignIn}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowGoogleSignIn(false)}
            >
              <IconSymbol name="xmark" size={24} color="#718096" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Google 계정으로 로그인</Text>
            <View style={styles.googleSignInContainer}>
              <View
                id="google-signin-button"
                style={styles.googleSignInButtonContainer}
              />
            </View>
            <TouchableOpacity
              style={styles.modalGoogleButton}
              onPress={() => {
                if ((window as any).google) {
                  (window as any).google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    { theme: 'dark', size: 'large', width: '300' }
                  );
                }
              }}
            >
              <Text style={styles.modalGoogleButtonText}>
                Google 로그인 버튼 표시
              </Text>
            </TouchableOpacity>
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
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  nebula: {
    position: 'absolute',
    borderRadius: 999,
  },
  nebula1: {
    width: 350,
    height: 350,
    backgroundColor: '#553C9A',
    opacity: 0.04,
    top: -80,
    left: -100,
  },
  nebula2: {
    width: 280,
    height: 280,
    backgroundColor: '#2B6CB0',
    opacity: 0.05,
    bottom: 100,
    right: -80,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#F5C842',
    letterSpacing: 1,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
  },
  lastSync: {
    fontSize: 11,
    color: '#4A5568',
  },
  logoutButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2A3A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleSignInButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  googleSignInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F5C842',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
  },
  infoCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E2A3A',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    lineHeight: 18,
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A0E1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 20,
    textAlign: 'center',
  },
  googleSignInContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  googleSignInButtonContainer: {
    minHeight: 40,
  },
  modalGoogleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGoogleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});
