import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';
import { BIOMARKERS } from '../constants/data';
import DataFlowVisualization from '../components/DataFlowVisualization';
import GlassmorphicCard from '../components/GlassmorphicCard';
import { runInference } from '../services/modelService';

const { width, height } = Dimensions.get('window');

export default function AnalysisScreen({ navigation, route }) {
  const { formData, proteinData } = route.params || {};
  
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnims = useRef([...Array(5)].map(() => new Animated.Value(0))).current;

  const phases = [
    { label: 'Preprocessing Data', icon: '📊', duration: 800 },
    { label: 'Extracting Features', icon: '🔬', duration: 1000 },
    { label: 'Running Neural Network', icon: '🧠', duration: 1200 },
    { label: 'Analyzing Biomarkers', icon: '🧬', duration: 800 },
    { label: 'Generating Report', icon: '📋', duration: 600 },
  ];

  useEffect(() => {
    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation (using native driver with scaleX)
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 4500,
      useNativeDriver: true, // Using scaleX transform instead of width
    }).start();

    const progressListener = progressAnim.addListener(({ value }) => {
      setProgressPct(Math.round(value * 100));
    });

    // Phase animations
    let totalDelay = 0;
    phases.forEach((phase, index) => {
      setTimeout(() => {
        setCurrentPhase(index);
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, totalDelay);
      totalDelay += phase.duration;
    });

    // Navigate to results after analysis
    const timer = setTimeout(async () => {
      try {
        const res = await runInference({ formData, proteinData });
        const prediction = res?.prediction || generatePrediction(formData, proteinData);
        const topProteins = res?.topProteins?.length
          ? res.topProteins
          : proteinData?.topProteins?.length
            ? proteinData.topProteins
            : BIOMARKERS.slice(0, 10);

        navigation.replace('Result', { prediction, formData, proteinData, topProteins });
      } catch (e) {
        // Surface failure clearly; keep app flowing.
        const fallback = generatePrediction(formData, proteinData);
        const topProteins = proteinData?.topProteins?.length
          ? proteinData.topProteins
          : BIOMARKERS.slice(0, 10);
        navigation.replace('Result', { prediction: fallback, formData, proteinData, topProteins, apiError: e.message });
      }
    }, 5000);

    return () => {
      clearTimeout(timer);
      progressAnim.removeListener(progressListener);
    };
  }, []);

  const generatePrediction = (data, proteins) => {
    // Mock ML prediction logic based on input data
    // In real app, this would call an actual ML model
    let riskScore = 0.3; // Base risk
    
    if (data?.age && parseInt(data.age) > 60) riskScore += 0.15;
    if (data?.age && parseInt(data.age) > 70) riskScore += 0.1;
    if (data?.family_history_pd === 'Yes') riskScore += 0.2;
    if (data?.cognitive_score && parseInt(data.cognitive_score) < 24) riskScore += 0.15;
    if (data?.smoking_history === 'Current') riskScore += 0.05;
    
    // Proteomics influence: tilt score based on uploaded signals
    if (proteins?.allProteins?.length) {
      const avgImportance =
        proteins.allProteins.reduce((sum, p) => sum + (p.importance || 0), 0) /
        proteins.allProteins.length;
      // Center around 0.5, scale modestly
      riskScore += (avgImportance - 0.5) * 0.25;
    }

    // Add some randomness for demo
    riskScore += (Math.random() * 0.2 - 0.1);
    riskScore = Math.max(0.05, Math.min(0.95, riskScore));
    
    const isPositive = riskScore > 0.5;
    
    return {
      isPositive,
      confidence: isPositive ? riskScore : (1 - riskScore),
      riskScore,
      riskLevel: riskScore > 0.7 ? 'High' : riskScore > 0.4 ? 'Moderate' : 'Low',
    };
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressScale = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0A1628', '#1A2D4A', '#0F172A']}
        style={styles.container}
      >
        {/* Animated Background */}
        <View style={styles.backgroundElements}>
          {[...Array(15)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  left: Math.random() * width,
                  top: Math.random() * height,
                  transform: [{ scale: pulseAnim }],
                  opacity: 0.2 + Math.random() * 0.2,
                },
              ]}
            />
          ))}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Analyzing Data</Text>
            <Text style={styles.subtitle}>Deep Learning Model Processing</Text>
            <Text style={styles.modelInfo}>FNN Model | GNPC V1 Dataset</Text>
          </View>

          {/* Brain Animation */}
          <View style={styles.animationContainer}>
            <Animated.View
              style={[
                styles.outerRing,
                { transform: [{ rotate: rotation }] },
              ]}
            >
              {[...Array(16)].map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.ringDot,
                    { transform: [{ rotate: `${i * 22.5}deg` }, { translateY: -90 }] },
                  ]}
                />
              ))}
            </Animated.View>

            <Animated.View
              style={[
                styles.middleRing,
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
                <View
                  key={i}
                  style={[
                    styles.ringDotSmall,
                    { transform: [{ rotate: `${i * 30}deg` }, { translateY: -60 }] },
                  ]}
                />
              ))}
            </Animated.View>

            <Animated.View
              style={[
                styles.brainContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <LinearGradient
                colors={['rgba(0, 212, 170, 0.3)', 'rgba(0, 212, 170, 0.1)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.brainEmoji}>🧠</Text>
            </Animated.View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Analysis Progress</Text>
              <Text style={styles.progressText}>{progressPct}%</Text>
            </View>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { transform: [{ scaleX: progressScale }] },
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
          </View>

          {/* Advanced Data Flow Visualization */}
          <GlassmorphicCard style={styles.dataFlowCard}>
            <Text style={styles.dataFlowTitle}>Proteomic Data Pipeline</Text>
            <Text style={styles.dataFlowSubtitle}>Real-time processing flow</Text>
            <View style={styles.dataFlowContainer}>
              <DataFlowVisualization active={true} />
            </View>
          </GlassmorphicCard>

          {/* Neural Network Visualization */}
          <GlassmorphicCard style={styles.networkContainer}>
            <Text style={styles.networkTitle}>Feedforward Neural Network</Text>
            <Text style={styles.networkSubtitle}>Model Architecture Active</Text>
            <View style={styles.networkLayers}>
              {[4, 8, 6, 4, 2].map((nodes, layerIndex) => (
                <View key={layerIndex} style={styles.layer}>
                  {[...Array(nodes)].map((_, nodeIndex) => (
                    <Animated.View
                      key={nodeIndex}
                      style={[
                        styles.node,
                        {
                          opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.2],
                            outputRange: [0.4, 1],
                          }),
                        },
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.layerLabels}>
              <Text style={styles.layerLabel}>Input</Text>
              <Text style={styles.layerLabel}>Hidden 1</Text>
              <Text style={styles.layerLabel}>Hidden 2</Text>
              <Text style={styles.layerLabel}>Hidden 3</Text>
              <Text style={styles.layerLabel}>Output</Text>
            </View>
          </GlassmorphicCard>

          {/* Analysis Phases - Professional Status Cards */}
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Analysis Pipeline</Text>
            {[
              { icon: '📊', label: 'Data Preprocessing', desc: 'GNPC V1 proteomic data normalization', phase: 0 },
              { icon: '🔬', label: 'Feature Extraction', desc: 'RF + LASSO feature selection', phase: 1 },
              { icon: '🧠', label: 'Neural Network Inference', desc: 'FNN model classification', phase: 2 },
              { icon: '🧬', label: 'Biomarker Analysis', desc: 'Key protein markers identified', phase: 3 },
              { icon: '📋', label: 'Report Generation', desc: 'Clinical assessment summary', phase: 4 },
            ].map((item, idx) => {
              const active = currentPhase >= idx;
              const isCurrent = currentPhase === idx;
              return (
                <Animated.View
                  key={item.label}
                  style={[
                    styles.statusCard,
                    active && styles.statusCardActive,
                    isCurrent && styles.statusCardCurrent,
                    {
                      opacity: fadeAnims[Math.min(idx, fadeAnims.length - 1)],
                      transform: [
                        {
                          translateY: fadeAnims[Math.min(idx, fadeAnims.length - 1)].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.statusLeft}>
                    <View style={[styles.statusIcon, active && styles.statusIconActive, isCurrent && styles.statusIconCurrent]}>
                      <Text style={styles.statusEmoji}>{item.icon}</Text>
                    </View>
                    <View style={styles.statusTextBlock}>
                      <Text style={[styles.statusLabel, active && styles.statusLabelActive]}>
                        {item.label}
                      </Text>
                      <Text style={[styles.statusDesc, active && styles.statusDescActive]}>
                        {item.desc}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusCheck, active && styles.statusCheckActive]}>
                    {active ? (
                      <Text style={styles.statusCheckTextActive}>✓</Text>
                    ) : (
                      <View style={styles.statusCheckPending} />
                    )}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
  },
  backgroundElements: {
    position: 'absolute',
    width: width,
    height: height,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.xxl,
    paddingHorizontal: SIZES.lg,
    alignItems: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
    width: '100%',
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.medium,
    color: COLORS.lightGray,
    marginBottom: SIZES.xs,
    textAlign: 'center',
  },
  modelInfo: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  animationContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.lg,
  },
  outerRing: {
    position: 'absolute',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middleRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  ringDotSmall: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#667EEA',
  },
  brainContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
    overflow: 'hidden',
  },
  brainEmoji: {
    fontSize: 36,
    zIndex: 10,
  },
  progressContainer: {
    width: '100%',
    marginBottom: SIZES.lg,
    paddingHorizontal: SIZES.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  progressLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: SIZES.medium,
    color: COLORS.accent,
    fontWeight: '700',
  },
  phasesContainer: {
    width: '100%',
    marginBottom: SIZES.xl,
  },
  phaseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
  },
  phaseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  phaseIconActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
  },
  phaseEmoji: {
    fontSize: 18,
  },
  phaseLabel: {
    flex: 1,
    fontSize: SIZES.regular,
    color: COLORS.gray,
  },
  phaseLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  phaseIndicator: {
    marginLeft: SIZES.sm,
  },
  phaseIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  checkmark: {
    fontSize: SIZES.medium,
    color: COLORS.accent,
    fontWeight: '700',
    marginLeft: SIZES.sm,
  },
  dataFlowCard: {
    width: '100%',
    marginBottom: SIZES.lg,
    padding: SIZES.md,
    minHeight: 200,
  },
  dataFlowTitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.xs,
    fontWeight: '700',
  },
  dataFlowSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.md,
  },
  dataFlowContainer: {
    height: 180,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
  },
  networkContainer: {
    alignItems: 'center',
    width: '100%',
    marginBottom: SIZES.lg,
    padding: SIZES.md,
  },
  networkTitle: {
    fontSize: SIZES.medium,
    color: COLORS.white,
    marginBottom: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  networkSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.md,
    letterSpacing: 0.5,
  },
  networkLayers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  layer: {
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
  },
  node: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
    marginVertical: 1.5,
  },
  layerLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: SIZES.xs,
  },
  layerLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SIZES.md,
    textAlign: 'left',
    width: '100%',
  },
  statusContainer: {
    width: '100%',
    marginTop: SIZES.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statusCardActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.08)',
    borderColor: 'rgba(0, 212, 170, 0.2)',
  },
  statusCardCurrent: {
    backgroundColor: 'rgba(0, 212, 170, 0.12)',
    borderColor: COLORS.accent,
    borderWidth: 1.5,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  statusIconActive: {
    backgroundColor: 'rgba(0,212,170,0.15)',
  },
  statusIconCurrent: {
    backgroundColor: 'rgba(0,212,170,0.25)',
  },
  statusEmoji: {
    fontSize: 22,
  },
  statusTextBlock: {
    flex: 1,
  },
  statusLabel: {
    color: COLORS.gray,
    fontSize: SIZES.regular,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusLabelActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  statusDesc: {
    color: COLORS.darkGray,
    fontSize: SIZES.small,
    lineHeight: 18,
  },
  statusDescActive: {
    color: COLORS.lightGray,
  },
  statusCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  statusCheckActive: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0,212,170,0.2)',
  },
  statusCheckPending: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusCheckTextActive: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: SIZES.regular,
  },
  bottomSpacing: {
    height: SIZES.xl,
  },
});

