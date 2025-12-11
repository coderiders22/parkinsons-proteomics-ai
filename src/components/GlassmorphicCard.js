import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

export default function GlassmorphicCard({ children, style, intensity = 20, variant = 'dark' }) {
  const isLight = variant === 'light';
  
  return (
    <View style={[styles.container, isLight && styles.lightContainer, style]}>
      {!isLight && <BlurView intensity={intensity} style={StyleSheet.absoluteFill} tint="dark" />}
      {isLight && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightContainer: {
    backgroundColor: COLORS.white,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  content: {
    padding: SIZES.md,
  },
});

