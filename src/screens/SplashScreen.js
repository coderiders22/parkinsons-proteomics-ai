import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Logo animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Text animations
  const textFade = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const subtitleFade = useRef(new Animated.Value(0)).current;
  
  // Progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingTextOpacity = useRef(new Animated.Value(0.5)).current;
  
  // Background particles - reduced opacity to avoid text overlap
  const particleAnims = useRef(
    Array.from({ length: 15 }, () => ({
      x: new Animated.Value(Math.random() * width),
      y: new Animated.Value(Math.random() * height),
      opacity: new Animated.Value(0.1 + Math.random() * 0.15), // Much lower opacity
      scale: new Animated.Value(0.4 + Math.random() * 0.3), // Smaller particles
    }))
  ).current;
  
  // Neural network lines
  const lineAnims = useRef(
    Array.from({ length: 12 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animated gradient background (opacity can use native driver)
    // Start separately - can't mix native and JS drivers in parallel
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, // Opacity supports native driver
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true, // Opacity supports native driver
        }),
      ])
    ).start();

    // Particle animations (separate loops to avoid driver mixing)
    particleAnims.forEach((particle) => {
      // X movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Y movement
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * height,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * height,
            duration: 3000 + Math.random() * 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Opacity flicker
      Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.8,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: false,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.2,
            duration: 1000 + Math.random() * 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    // Neural network lines animation
    lineAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1500 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1500 + index * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ])
      ).start();
    });

    // Main logo animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 15,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textFade, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleFade, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for neural network
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Continuous pulse for brain icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress bar animation (using native driver with scaleX)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true, // Using scaleX transform instead of width
    }).start();

    Animated.timing(loadingTextOpacity, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true, // Opacity can use native driver
    }).start();

    // Navigate to Login after splash
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: glowOpacity },
        ]}
      >
        <LinearGradient
          colors={['#0A1628', '#1A2D4A', '#0F172A', '#1A2D4A', '#0A1628']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Animated Background Circles with Glow */}
      <View style={styles.backgroundCircles}>
        {[1, 2, 3].map((num) => (
          <Animated.View
            key={num}
            style={[
              styles[`circle${num}`],
              {
                transform: [
                  { scale: pulseAnim.interpolate({
                    inputRange: [1, 1.15],
                    outputRange: [1, 1.1 + num * 0.05],
                  })},
                ],
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.3],
                }),
              },
            ]}
          />
        ))}
      </View>

      {/* Animated Particles - Background Only */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particleAnims.map((particle, index) => (
          <Animated.View
            key={index}
            style={[
              styles.particle,
              {
                left: particle.x,
                top: particle.y,
                opacity: particle.opacity,
                transform: [{ scale: particle.scale }],
              },
            ]}
          />
        ))}
      </View>

      {/* Main Logo Container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Rotating Neural Network Ring */}
        <Animated.View
          style={[
            styles.neuralRing,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          {[...Array(16)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.neuralDot,
                {
                  transform: [
                    { rotate: `${i * 22.5}deg` },
                    { translateY: -100 },
                  ],
                  opacity: lineAnims[i % lineAnims.length].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.3, 1],
                  }),
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Inner Rotating Ring (Reverse) */}
        <Animated.View
          style={[
            styles.neuralRingInner,
            {
              transform: [
                { rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['360deg', '0deg'],
                })},
              ],
            },
          ]}
        >
          {[...Array(12)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.neuralDotSmall,
                {
                  transform: [
                    { rotate: `${i * 30}deg` },
                    { translateY: -70 },
                  ],
                  opacity: lineAnims[(i + 4) % lineAnims.length].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.4, 0.9],
                  }),
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Brain Icon with Glow */}
        <Animated.View
          style={[
            styles.brainIcon,
            {
              transform: [{ scale: pulseAnim }],
              shadowOpacity: 0.7,
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(0, 212, 170, 0.3)', 'rgba(0, 212, 170, 0.1)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text style={styles.brainEmoji}>🧠</Text>
          
          {/* Glowing Ring */}
          <Animated.View
            style={[
              styles.glowRing,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </Animated.View>
      </Animated.View>

      {/* App Name with Slide Animation */}
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textFade,
            transform: [{ translateY: textSlide }],
            zIndex: 10, // Ensure text is above particles
          },
        ]}
      >
        <View style={styles.appNameContainer}>
          <Text style={styles.appName}>NeuroDetect</Text>
          <Text style={styles.appNameAccent}>AI</Text>
        </View>
      </Animated.View>

      {/* Subtitle */}
      <Animated.View
        style={[
          styles.subtitleContainer,
          {
            opacity: subtitleFade,
            transform: [
              {
                translateY: subtitleFade.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              },
            ],
            zIndex: 10, // Ensure text is above particles
          },
        ]}
      >
        <Text style={styles.subtitle}>Early Parkinson's Disease Detection</Text>
        <Text style={styles.subSubtitle}>Powered by Deep Learning & Proteomics</Text>
      </Animated.View>

      {/* Animated Loading Indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: subtitleFade,
            zIndex: 10, // Ensure text is above particles
          },
        ]}
      >
        <View style={styles.loadingBarContainer}>
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  transform: [{ scaleX: progressScale }],
                },
              ]}
            >
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentLight, COLORS.accent]}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>
          </View>
          <Animated.View
            style={{
              opacity: loadingTextOpacity,
            }}
          >
            <Text style={styles.loadingText}>
              Initializing Neural Network...
            </Text>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Version with Fade - Fixed Position */}
      <Animated.View
        style={[
          styles.versionContainer,
          {
            opacity: subtitleFade,
            zIndex: 10,
          },
        ]}
      >
        <Text style={styles.version}>
          v1.0.0 | GNPC V1 Dataset
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  backgroundCircles: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 1,
  },
  particlesContainer: {
    position: 'absolute',
    width: width,
    height: height,
    zIndex: 2, // Behind text but above background
  },
  circle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: height * 0.05,
    left: -150,
    borderWidth: 2,
    borderColor: 'rgba(0, 212, 170, 0.15)',
    backgroundColor: 'rgba(0, 212, 170, 0.08)',
  },
  circle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: height * 0.45,
    right: -100,
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.15)',
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
  },
  circle3: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: height * 0.1,
    left: width * 0.05,
    borderWidth: 2,
    borderColor: 'rgba(245, 87, 108, 0.15)',
    backgroundColor: 'rgba(245, 87, 108, 0.08)',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xxl,
    width: 250,
    height: 250,
  },
  neuralRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neuralRingInner: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neuralDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  neuralDotSmall: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#667EEA',
  },
  brainIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    elevation: 20,
    overflow: 'hidden',
  },
  brainEmoji: {
    fontSize: 70,
    zIndex: 10,
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
    zIndex: 10,
  },
  appNameContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
  },
  appName: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -1.5,
    textShadowColor: 'rgba(0, 212, 170, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  appNameAccent: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: -1.5,
    marginLeft: SIZES.sm,
    textShadowColor: COLORS.accent,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xxl,
    paddingHorizontal: SIZES.xl,
    zIndex: 10,
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.lightGray,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  subSubtitle: {
    fontSize: SIZES.regular,
    color: COLORS.gray,
    marginTop: SIZES.xs,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 140,
    width: width - SIZES.xl * 2,
    paddingHorizontal: SIZES.lg,
    zIndex: 10,
  },
  loadingBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  loadingBar: {
    width: '100%',
    maxWidth: 280,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
    borderRadius: 3,
    overflow: 'hidden',
  },
  loadingText: {
    color: COLORS.lightGray,
    fontSize: SIZES.small,
    letterSpacing: 1,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  version: {
    color: COLORS.darkGray,
    fontSize: SIZES.tiny,
    letterSpacing: 0.5,
    fontWeight: '500',
  },
});

