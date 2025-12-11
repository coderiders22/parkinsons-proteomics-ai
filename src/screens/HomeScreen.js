import React, { useRef, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { DATASET_STATS, MODEL_METRICS } from '../constants/data';
import AdvancedNeuralNetwork from '../components/AdvancedNeuralNetwork';
import GlassmorphicCard from '../components/GlassmorphicCard';
import ConfusionMatrix from '../components/ConfusionMatrix';
import TrainingCurves from '../components/TrainingCurves';
import ROCCurves from '../components/ROCCurves';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation, route }) {
  const userName = route?.params?.userName || 'Researcher';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Staggered card animations
    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 300 + index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const StatCard = ({ icon, value, label, color, index }) => (
    <Animated.View
      style={[
        styles.statCard,
        {
          opacity: cardAnims[index],
          transform: [
            {
              translateY: cardAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A1628', '#1A2D4A']}
        style={styles.header}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>Welcome back, {userName}</Text>
              <View style={styles.titleRow}>
                <Text style={styles.title}>NeuroDetect</Text>
                <Text style={styles.titleAccent}>AI</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => navigation.navigate('About')}
            >
              <Ionicons name="information-circle-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>
            Early Parkinson's Disease Detection using Deep Learning on GNPC V1 Proteomic Data
          </Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Action Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Upload')}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.mainCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.mainCardContent}>
              <View style={styles.mainCardIcon}>
                <Text style={styles.mainCardEmoji}>🔬</Text>
              </View>
              <View style={styles.mainCardText}>
                <Text style={styles.mainCardTitle}>Upload & Start</Text>
                <Text style={styles.mainCardSubtitle}>
                  Upload proteomics Excel, then capture patient data
                </Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={40} color={COLORS.white} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Model Performance</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="analytics"
            value={`${(MODEL_METRICS.accuracy * 100).toFixed(0)}%`}
            label="Accuracy"
            color={COLORS.accent}
            index={0}
          />
          <StatCard
            icon="pulse"
            value={`${(MODEL_METRICS.sensitivity * 100).toFixed(0)}%`}
            label="Sensitivity"
            color="#667EEA"
            index={1}
          />
          <StatCard
            icon="shield-checkmark"
            value={`${(MODEL_METRICS.specificity * 100).toFixed(0)}%`}
            label="Specificity"
            color="#F5576C"
            index={2}
          />
          <StatCard
            icon="trending-up"
            value={MODEL_METRICS.auc.toFixed(2)}
            label="AUC Score"
            color="#FFB800"
            index={3}
          />
        </View>

        {/* Model Performance Visualizations */}
        <GlassmorphicCard variant="light" style={styles.visualizationCard}>
          <ConfusionMatrix />
        </GlassmorphicCard>

        <GlassmorphicCard variant="light" style={styles.visualizationCard}>
          <TrainingCurves />
        </GlassmorphicCard>

        <GlassmorphicCard variant="light" style={styles.visualizationCard}>
          <ROCCurves />
        </GlassmorphicCard>

        {/* Advanced Neural Network Visualization */}
        <Text style={styles.sectionTitle}>Model Architecture</Text>
        <GlassmorphicCard variant="light" style={styles.neuralNetworkCard}>
          <View style={styles.neuralNetworkHeader}>
            <View style={styles.neuralNetworkIconContainer}>
              <Ionicons name="code-working" size={22} color={COLORS.accent} />
            </View>
            <Text style={styles.neuralNetworkTitle}>Feedforward Neural Network</Text>
          </View>
          <View style={styles.neuralNetworkContainer}>
            <AdvancedNeuralNetwork active={true} />
          </View>
          <View style={styles.neuralNetworkInfo}>
            <View style={styles.neuralNetworkInfoItem}>
              <Text style={styles.neuralNetworkInfoLabel}>Layers</Text>
              <Text style={styles.neuralNetworkInfoValue}>5</Text>
            </View>
            <View style={styles.neuralNetworkInfoDivider} />
            <View style={styles.neuralNetworkInfoItem}>
              <Text style={styles.neuralNetworkInfoLabel}>Parameters</Text>
              <Text style={styles.neuralNetworkInfoValue}>~2.4M</Text>
            </View>
            <View style={styles.neuralNetworkInfoDivider} />
            <View style={styles.neuralNetworkInfoItem}>
              <Text style={styles.neuralNetworkInfoLabel}>Activation</Text>
              <Text style={styles.neuralNetworkInfoValue}>ReLU</Text>
            </View>
          </View>
        </GlassmorphicCard>

        {/* Dataset Info */}
        <Text style={styles.sectionTitle}>Dataset Overview</Text>
        <GlassmorphicCard variant="light" style={styles.datasetCard}>
          <View style={styles.datasetHeader}>
            <Text style={styles.datasetEmoji}>📊</Text>
            <Text style={styles.datasetTitle}>GNPC V1 Harmonized Dataset</Text>
          </View>
          
          <View style={styles.datasetStats}>
            <View style={styles.datasetStatItem}>
              <Text style={styles.datasetStatValue}>{DATASET_STATS.participants.toLocaleString()}</Text>
              <Text style={styles.datasetStatLabel}>Participants</Text>
            </View>
            <View style={styles.datasetDivider} />
            <View style={styles.datasetStatItem}>
              <Text style={styles.datasetStatValue}>{DATASET_STATS.cohorts}</Text>
              <Text style={styles.datasetStatLabel}>Cohorts</Text>
            </View>
            <View style={styles.datasetDivider} />
            <View style={styles.datasetStatItem}>
              <Text style={styles.datasetStatValue}>{DATASET_STATS.clinicalFeatures}</Text>
              <Text style={styles.datasetStatLabel}>Features</Text>
            </View>
          </View>

          <Text style={styles.datasetDescription}>
            Comprehensive multicohort proteomic dataset with {DATASET_STATS.proteinMeasurements} protein measurements across plasma, serum, and CSF samples.
          </Text>
        </GlassmorphicCard>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Biomarkers')}
          >
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionEmoji}>🧬</Text>
            </LinearGradient>
            <Text style={styles.actionText}>Biomarkers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('About')}
          >
            <LinearGradient
              colors={['#F093FB', '#F5576C']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionEmoji}>📖</Text>
            </LinearGradient>
            <Text style={styles.actionText}>About</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Upload', { quickTest: true })}
          >
            <LinearGradient
              colors={['#4FACFE', '#00F2FE']}
              style={styles.actionGradient}
            >
              <Text style={styles.actionEmoji}>⚡</Text>
            </LinearGradient>
            <Text style={styles.actionText}>Quick Test</Text>
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
    paddingBottom: SIZES.xl,
    paddingHorizontal: SIZES.lg,
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  headerContent: {},
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: SIZES.regular,
    color: COLORS.gray,
    marginBottom: SIZES.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  title: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: -1,
  },
  titleAccent: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.accent,
    marginLeft: SIZES.xs,
  },
  infoButton: {
    padding: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.regular,
    color: COLORS.lightGray,
    marginTop: SIZES.md,
    lineHeight: 22,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
  },
  mainCard: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    ...SHADOWS.large,
  },
  mainCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mainCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  mainCardEmoji: {
    fontSize: 28,
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  mainCardSubtitle: {
    fontSize: SIZES.regular,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.lg,
    marginTop: SIZES.sm,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SIZES.xs,
    marginBottom: SIZES.xl,
  },
  statCard: {
    width: (width - SIZES.lg * 2 - SIZES.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    margin: SIZES.xs,
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
  },
  statValue: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    fontWeight: '500',
  },
  neuralNetworkCard: {
    marginBottom: SIZES.xl,
    padding: SIZES.xl,
    minHeight: 280,
  },
  neuralNetworkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  neuralNetworkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.sm,
  },
  neuralNetworkTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  neuralNetworkContainer: {
    height: 200,
    marginVertical: SIZES.md,
    overflow: 'hidden',
    borderRadius: SIZES.radiusMd,
  },
  neuralNetworkInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  neuralNetworkInfoItem: {
    alignItems: 'center',
  },
  neuralNetworkInfoLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.darkGray,
    marginBottom: SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  neuralNetworkInfoValue: {
    fontSize: SIZES.regular,
    fontWeight: '800',
    color: COLORS.accent,
    letterSpacing: -0.5,
  },
  neuralNetworkInfoDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  datasetCard: {
    padding: SIZES.xl,
    marginBottom: SIZES.xl,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  datasetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  datasetEmoji: {
    fontSize: 24,
    marginRight: SIZES.sm,
  },
  datasetTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: -0.3,
  },
  datasetStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.offWhite,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
  },
  datasetStatItem: {
    alignItems: 'center',
  },
  datasetStatValue: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.accent,
  },
  datasetStatLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
    marginTop: SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  datasetDivider: {
    width: 1,
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  datasetDescription: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    alignItems: 'center',
    width: (width - SIZES.lg * 2 - SIZES.lg) / 3,
  },
  actionGradient: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
    ...SHADOWS.medium,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionText: {
    fontSize: SIZES.small,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  bottomPadding: {
    height: SIZES.xl,
  },
  visualizationCard: {
    marginBottom: SIZES.xl,
    padding: 0,
    overflow: 'hidden',
  },
});

