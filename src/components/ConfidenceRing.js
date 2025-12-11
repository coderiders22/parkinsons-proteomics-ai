import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const CIRCLE_SIZE = 120;

export default function ConfidenceRing({ value, label, color = COLORS.accent, size = CIRCLE_SIZE }) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Progress animation (using native driver with scaleX)
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 2000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true, // Using scaleX transform instead of width
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [value]);

  const progressScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ringContainer,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        {/* Outer Glow Ring */}
        <Animated.View
          style={[
            styles.outerGlow,
            {
              width: size + 20,
              height: size + 20,
              borderRadius: (size + 20) / 2,
              opacity: glowOpacity,
              borderColor: color,
            },
          ]}
        />

        {/* Background Circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Progress Ring - Top Half */}
        <View style={[styles.progressContainer, { width: size, height: size / 2 }]}>
          <View style={styles.progressTop}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  transform: [{ scaleX: progressScale }],
                  backgroundColor: color,
                },
              ]}
            >
              <LinearGradient
                colors={[color, color + 'CC']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
        </View>

        {/* Center Content */}
        <View style={styles.centerContent}>
          <View style={styles.valueContainer}>
            <Animated.Text
              style={[
                styles.value,
                {
                  opacity: progressAnim.interpolate({
                    inputRange: [0, 0.1, 1],
                    outputRange: [0, 0.5, 1],
                  }),
                },
              ]}
            >
              {Math.round(value * 100)}
            </Animated.Text>
            <Text style={styles.percentSign}>%</Text>
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  outerGlow: {
    position: 'absolute',
    borderWidth: 3,
    backgroundColor: 'transparent',
  },
  circleBackground: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
  },
  progressTop: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: SIZES.xxlarge,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -2,
  },
  percentSign: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: 2,
  },
  label: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SIZES.xs,
  },
});
