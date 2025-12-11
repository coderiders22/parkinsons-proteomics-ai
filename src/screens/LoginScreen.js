import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { login as apiLogin } from '../services/authService';

export default function LoginScreen({ navigation, route }) {
  const { newUserName, newUserEmail, justRegistered } = route?.params || {};
  const [email, setEmail] = useState(newUserEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '', action: () => {} });

  useEffect(() => {
    if (justRegistered) {
      setModalContent({
        title: 'Signed up successfully',
        message: 'You can now login.',
        action: () => setModalVisible(false),
      });
      setModalVisible(true);
    }
  }, [justRegistered]);

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    setError('');
    apiLogin({ email, password })
      .then((res) => {
        const displayName =
          newUserName ||
          res?.user?.name ||
          (email.includes('@') ? email.split('@')[0] : email) ||
          'Researcher';
        setModalContent({
          title: 'Login successful',
          message: `Welcome, ${displayName}!`,
          action: () => {
            setModalVisible(false);
            navigation.replace('Home', { userName: displayName });
          },
        });
        setModalVisible(true);
      })
      .catch((err) => {
        setError(err.message || 'Login failed. Please try again.');
      });
  };

  return (
    <LinearGradient
      colors={['#0A1628', '#1A2D4A', '#0F172A']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="shield-checkmark" size={36} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Securely access NeuroDetect AI</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sign in</Text>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail" size={18} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={18} color={COLORS.darkGray} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity activeOpacity={0.9} onPress={handleLogin} style={styles.primaryButton}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.primaryButtonBg}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.primaryButtonText}>Login</Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>
                New researcher? <Text style={styles.link}>Create account</Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>Designed and Developed by Manav Rai • All Rights Reserved</Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Ionicons name="checkmark-circle" size={36} color={COLORS.accent} />
            <Text style={styles.modalTitle}>{modalContent.title}</Text>
            <Text style={styles.modalMessage}>{modalContent.message}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={modalContent.action}>
              <Text style={styles.modalButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: SIZES.lg,
  },
  keyboard: { flex: 1 },
  content: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl * 1.6,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 212, 170, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.35)',
  },
  title: {
    fontSize: SIZES.title,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: COLORS.primary,
    fontWeight: '600',
  },
  error: {
    color: COLORS.danger,
    marginBottom: SIZES.sm,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  primaryButtonBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: SIZES.regular,
    letterSpacing: 0.3,
  },
  secondaryButton: {
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  secondaryText: {
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  link: {
    color: COLORS.accent,
  },
  footer: {
    marginTop: SIZES.lg,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.lg,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    width: '90%',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: SIZES.sm,
    textAlign: 'center',
  },
  modalMessage: {
    color: COLORS.darkGray,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButton: {
    marginTop: SIZES.md,
    backgroundColor: COLORS.accent,
    paddingVertical: 12,
    paddingHorizontal: SIZES.xl,
    borderRadius: SIZES.radiusMd,
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

