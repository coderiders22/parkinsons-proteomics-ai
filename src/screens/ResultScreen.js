import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { MODEL_METRICS, BIOMARKERS } from '../constants/data';
import InteractiveBiomarkerChart from '../components/InteractiveBiomarkerChart';
import GlassmorphicCard from '../components/GlassmorphicCard';
import ConfidenceRing from '../components/ConfidenceRing';

const { width } = Dimensions.get('window');

export default function ResultScreen({ navigation, route }) {
  const { prediction, formData, proteinData, topProteins, backendResponse, apiError } = route.params || {};
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Handle both backend response and fallback prediction
  const isPositive = prediction?.isPositive || false;
  const confidence = prediction?.confidence || (prediction?.probability ? prediction.probability / 100 : 0.85);
  const riskLevel = prediction?.riskLevel || prediction?.risk_level || 'Moderate';
  const riskScore = prediction?.riskScore || (prediction?.probability ? prediction.probability / 100 : 0.39);

  useEffect(() => {
    // Main result animation sequence
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Ring progress animation (using native driver with scaleX)
    Animated.timing(ringAnim, {
      toValue: riskScore,
      duration: 2000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true, // Using scaleX transform instead of width
    }).start();

    // Continuous pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const resultColor = isPositive ? COLORS.danger : COLORS.success;
  // Professional medical color scheme - same style for both
  const resultGradient = isPositive
    ? ['#1A2D4A', '#2A4365', '#3A547F'] // Same professional blue gradient
    : ['#1A2D4A', '#2A4365', '#3A547F']; // Professional blue gradient

  const biomarkerSet = topProteins?.length ? topProteins : BIOMARKERS.slice(0, 10);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0A1628', '#1A2D4A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={styles.backButton}
          >
            <Ionicons name="close" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analysis Complete</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Result Card */}
        <Animated.View
          style={[
            styles.resultCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={resultGradient}
            style={styles.resultGradient}
          >
            {/* Professional Result Icon */}
            <Animated.View
              style={[
                styles.resultIconContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={[styles.resultIconCircle, { 
                backgroundColor: isPositive ? 'rgba(255, 77, 106, 0.2)' : 'rgba(0, 212, 170, 0.2)',
                borderColor: isPositive ? 'rgba(255, 77, 106, 0.6)' : 'rgba(0, 212, 170, 0.6)',
              }]}>
                {isPositive ? (
                  <Ionicons 
                    name="close-circle" 
                    size={56} 
                    color={COLORS.danger} 
                  />
                ) : (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={56} 
                    color={COLORS.success} 
                  />
                )}
              </View>
            </Animated.View>

            {/* Result Text */}
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultTitle}>
                {isPositive ? 'PD Indicators Detected' : 'No PD Indicators'}
              </Text>
              <Text style={styles.resultSubtitle}>
                {isPositive
                  ? 'Proteomic analysis suggests potential Parkinson\'s Disease biomarkers'
                  : 'Analysis shows normal proteomic profile'}
              </Text>
              
              {/* Clinical Significance Badge */}
              <View style={[styles.clinicalBadge, { 
                backgroundColor: isPositive ? 'rgba(255, 77, 106, 0.15)' : 'rgba(0, 212, 170, 0.15)',
                borderColor: isPositive ? 'rgba(255, 77, 106, 0.3)' : 'rgba(0, 212, 170, 0.3)',
              }]}>
                <Ionicons 
                  name={isPositive ? "close-circle" : "checkmark-circle"} 
                  size={16} 
                  color={isPositive ? COLORS.danger : COLORS.success} 
                />
                <Text style={[styles.clinicalBadgeText, { color: isPositive ? COLORS.danger : COLORS.success }]}>
                  {isPositive ? 'Clinical Review Recommended' : 'Within Normal Range'}
                </Text>
              </View>
            </View>

            {/* Professional AI-Style Prediction Display */}
            <View style={styles.predictionContainer}>
              <View style={styles.predictionHeader}>
                <Ionicons name="analytics" size={20} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.predictionLabel}>AI Prediction Score</Text>
              </View>
              
              <View style={styles.predictionScoreContainer}>
                <View style={styles.predictionScoreMain}>
                  <Animated.Text
                    style={[
                      styles.predictionScoreValue,
                      {
                        opacity: fadeAnim,
                      },
                    ]}
                  >
                    {(confidence * 100).toFixed(0)}
                  </Animated.Text>
                  <Text style={styles.predictionScoreUnit}>%</Text>
                </View>
                <Text style={styles.predictionScoreLabel}>Confidence Level</Text>
              </View>

              {/* Professional Score Breakdown */}
              <View style={styles.scoreBreakdown}>
                <View style={styles.scoreItem}>
                  <Ionicons name="shield-checkmark" size={20} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.scoreItemLabel}>Model Accuracy</Text>
                  <Text style={styles.scoreItemValue}>{(MODEL_METRICS.accuracy * 100).toFixed(1)}%</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreItem}>
                  <Ionicons name="pulse" size={20} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.scoreItemLabel}>Sensitivity</Text>
                  <Text style={styles.scoreItemValue}>{(MODEL_METRICS.sensitivity * 100).toFixed(1)}%</Text>
                </View>
                <View style={styles.scoreDivider} />
                <View style={styles.scoreItem}>
                  <Ionicons name="checkmark-done-circle" size={20} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.scoreItemLabel}>Specificity</Text>
                  <Text style={styles.scoreItemValue}>{(MODEL_METRICS.specificity * 100).toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Risk Assessment - Enhanced for Research */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Clinical Risk Assessment</Text>
              <Text style={styles.sectionSubtitle}>Based on GNPC V1 Proteomic Dataset</Text>
            </View>
            <View style={styles.datasetBadge}>
              <Ionicons name="flask" size={14} color={COLORS.accent} />
              <Text style={styles.datasetBadgeText}>FNN Model</Text>
            </View>
          </View>
          
          <GlassmorphicCard variant="light" style={styles.riskCard}>
            <View style={styles.riskHeader}>
              <View style={[styles.riskLevelBadge, { backgroundColor: resultColor + '15', borderColor: resultColor }]}>
                <Ionicons name="shield" size={18} color={resultColor} />
                <Text style={[styles.riskLevelText, { color: resultColor }]}>
                  {riskLevel} Risk
                </Text>
              </View>
              <View style={styles.riskScoreContainer}>
                <Text style={styles.riskScoreLabel}>Risk Score</Text>
                <Text style={styles.riskScore}>
                  {(riskScore * 100).toFixed(0)}/100
                </Text>
              </View>
            </View>

            {/* Risk Meter */}
            <View style={styles.riskMeterContainer}>
              <View style={styles.riskMeter}>
                <View style={styles.riskMeterTrack}>
                  <Animated.View
                    style={[
                      styles.riskMeterFill,
                      {
                        transform: [{ scaleX: ringAnim }],
                        backgroundColor: resultColor,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={[resultColor, resultColor + 'CC']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </Animated.View>
                </View>
                <View style={styles.riskMeterLabels}>
                  <Text style={styles.riskMeterLabel}>Low</Text>
                  <Text style={styles.riskMeterLabel}>Moderate</Text>
                  <Text style={styles.riskMeterLabel}>High</Text>
                </View>
              </View>
            </View>

            <View style={styles.disclaimerContainer}>
              <View style={styles.disclaimerHeader}>
                <Ionicons name="information-circle" size={16} color={COLORS.darkGray} />
                <Text style={styles.disclaimerTitle}>Clinical Disclaimer</Text>
              </View>
              <Text style={styles.riskDisclaimer}>
                This assessment is based on the Feedforward Neural Network (FNN) model trained on the GNPC V1 harmonized proteomic dataset. Results are for research purposes only and should not replace clinical judgment. Always consult qualified healthcare professionals for diagnostic and treatment decisions.
              </Text>
            </View>
          </GlassmorphicCard>
        </Animated.View>

        {/* Model Metrics - Enhanced for Research */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Model Performance Metrics</Text>
              <Text style={styles.sectionSubtitle}>Validated on GNPC V1 Test Set</Text>
            </View>
          </View>
          
          <GlassmorphicCard variant="light" style={styles.metricsCard}>
            <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(MODEL_METRICS.accuracy * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(MODEL_METRICS.sensitivity * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Sensitivity</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {(MODEL_METRICS.specificity * 100).toFixed(0)}%
              </Text>
              <Text style={styles.metricLabel}>Specificity</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{MODEL_METRICS.auc}</Text>
              <Text style={styles.metricLabel}>AUC-ROC</Text>
            </View>
          </View>
          
          <View style={styles.metricsFooter}>
            <View style={styles.metricInfo}>
              <Ionicons name="stats-chart" size={14} color={COLORS.accent} />
              <Text style={styles.metricInfoText}>
                Cross-validated performance metrics
              </Text>
            </View>
          </View>
          </GlassmorphicCard>
        </Animated.View>

        {/* Proteomics Upload Summary */}
        {proteinData && (
          <Animated.View
            style={[
              styles.section,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Proteomics Upload</Text>
              <View style={styles.tag}>
                <Ionicons name="document-attach" size={14} color={COLORS.accent} />
                <Text style={styles.tagText}>50 features</Text>
              </View>
            </View>

            <GlassmorphicCard variant="light" style={styles.proteinCard}>
              <View style={styles.proteinRow}>
                <View style={styles.proteinIcon}>
                  <Ionicons name="flask" size={20} color={COLORS.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proteinTitle}>{proteinData?.fileName || 'Excel/CSV upload'}</Text>
                  <Text style={styles.proteinSubtitle}>
                    Top 10 proteins extracted for influence analysis
                  </Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              </View>

              <View style={styles.topProteinRow}>
                {biomarkerSet.slice(0, 3).map((p) => (
                  <View key={p.id} style={styles.topProteinPill}>
                    <Text style={styles.topProteinName}>{p.name}</Text>
                    <Text style={styles.topProteinScore}>{(p.importance * 100).toFixed(0)}%</Text>
                  </View>
                ))}
              </View>
            </GlassmorphicCard>
          </Animated.View>
        )}

        {/* Interactive Biomarker Analysis */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Biomarker Importance Analysis</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Biomarkers')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <GlassmorphicCard variant="light" style={styles.biomarkerChartCard}>
            <InteractiveBiomarkerChart
              biomarkers={biomarkerSet.slice(0, 6)}
              onBiomarkerPress={(biomarker) => {
                // Could navigate to detailed view
              }}
            />
          </GlassmorphicCard>
        </Animated.View>

        {/* API Error Notice (if any) */}
        {apiError && (
          <View style={styles.errorNotice}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.errorText}>
              Using fallback prediction. Backend error: {apiError}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Biomarkers')}
          >
            <LinearGradient
              colors={[COLORS.accent, COLORS.accentDark]}
              style={styles.primaryButtonGradient}
            >
              <Ionicons name="analytics" size={20} color={COLORS.white} />
              <Text style={styles.primaryButtonText}>View Detailed Analysis</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Upload')}
          >
            <Ionicons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>New Assessment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.offWhite,
  },
  header: {
    paddingTop: 60,
    paddingBottom: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: SIZES.sm,
    marginLeft: -SIZES.sm,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
  },
  resultCard: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.xl,
    ...SHADOWS.large,
  },
  resultGradient: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xl,
  },
  resultIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  resultTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    flexShrink: 1,
  },
  resultTextContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
    width: '100%',
  },
  resultSubtitle: {
    fontSize: SIZES.regular,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: SIZES.md,
    lineHeight: 24,
    paddingHorizontal: SIZES.lg,
    fontWeight: '500',
  },
  clinicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginTop: SIZES.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  clinicalBadgeText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    marginLeft: SIZES.xs,
    letterSpacing: 0.3,
  },
  predictionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SIZES.xl,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: SIZES.lg,
    width: '100%',
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  predictionLabel: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    marginLeft: SIZES.sm,
    letterSpacing: 0.3,
  },
  predictionScoreContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  predictionScoreMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SIZES.sm,
  },
  predictionScoreValue: {
    fontSize: 64,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: -2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  predictionScoreUnit: {
    fontSize: SIZES.xlarge,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: SIZES.xs,
  },
  predictionScoreLabel: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  scoreItemLabel: {
    fontSize: SIZES.tiny,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginTop: SIZES.xs,
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  scoreItemValue: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  scoreDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  confidenceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginTop: SIZES.sm,
  },
  confidenceLabel: {
    fontSize: SIZES.small,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: SIZES.xs,
  },
  confidenceValue: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.white,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  datasetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent + '15',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  datasetBadgeText: {
    fontSize: SIZES.tiny,
    color: COLORS.accent,
    fontWeight: '700',
    marginLeft: SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewAllText: {
    fontSize: SIZES.regular,
    color: COLORS.accent,
    fontWeight: '600',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    backgroundColor: 'rgba(0, 212, 170, 0.12)',
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.25)',
  },
  tagText: {
    color: COLORS.accent,
    fontWeight: '700',
    marginLeft: 6,
    fontSize: SIZES.small,
  },
  proteinCard: {
    padding: SIZES.lg,
  },
  proteinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  proteinIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 212, 170, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.25)',
  },
  proteinTitle: {
    fontSize: SIZES.regular,
    fontWeight: '800',
    color: COLORS.primary,
  },
  proteinSubtitle: {
    color: COLORS.darkGray,
    marginTop: 4,
  },
  topProteinRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topProteinPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginRight: SIZES.sm,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  topProteinName: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  topProteinScore: {
    color: COLORS.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  riskCard: {
    padding: SIZES.xl,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  riskLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
  },
  riskLevelText: {
    fontSize: SIZES.medium,
    fontWeight: '800',
    marginLeft: SIZES.xs,
    letterSpacing: -0.2,
  },
  riskScoreContainer: {
    alignItems: 'flex-end',
  },
  riskScoreLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.darkGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SIZES.xs,
  },
  riskScore: {
    fontSize: SIZES.xlarge,
    color: COLORS.primary,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  riskMeterContainer: {
    marginBottom: SIZES.md,
  },
  riskMeter: {},
  riskMeterTrack: {
    height: 12,
    backgroundColor: COLORS.lightGray,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
  },
  riskMeterFill: {
    height: '100%',
    width: '100%',
    borderRadius: 6,
  },
  riskMeterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  riskMeterLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
  },
  disclaimerContainer: {
    marginTop: SIZES.lg,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  disclaimerTitle: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: SIZES.xs,
  },
  riskDisclaimer: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  metricsCard: {
    padding: SIZES.xl,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.xs,
    marginBottom: SIZES.lg,
  },
  metricCard: {
    width: (width - SIZES.lg * 2 - SIZES.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    margin: SIZES.xs,
    alignItems: 'center',
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  metricValue: {
    fontSize: SIZES.xxlarge,
    fontWeight: '900',
    color: COLORS.accent,
    marginBottom: SIZES.sm,
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  metricsFooter: {
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricInfoText: {
    fontSize: SIZES.tiny,
    color: COLORS.darkGray,
    marginLeft: SIZES.xs,
    fontStyle: 'italic',
  },
  biomarkerChartCard: {
    marginTop: SIZES.md,
    padding: 0,
    overflow: 'hidden',
  },
  biomarkerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
    ...SHADOWS.small,
  },
  biomarkerRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  biomarkerRankText: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.white,
  },
  biomarkerInfo: {
    flex: 1,
  },
  biomarkerName: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
  },
  biomarkerSymbol: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  biomarkerImportance: {
    alignItems: 'flex-end',
  },
  importanceBar: {
    width: 60,
    height: 6,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.xs,
  },
  importanceFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 3,
  },
  importanceText: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
  },
  actions: {
    marginTop: SIZES.md,
  },
  primaryButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
  },
  primaryButtonText: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: SIZES.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.radiusMd,
  },
  secondaryButtonText: {
    fontSize: SIZES.medium,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SIZES.sm,
  },
  bottomPadding: {
    height: SIZES.xl,
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  errorText: {
    flex: 1,
    marginLeft: SIZES.sm,
    color: COLORS.darkGray,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

