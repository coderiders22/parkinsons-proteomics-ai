import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { DATASET_STATS, MODEL_METRICS } from '../constants/data';

const { width } = Dimensions.get('window');

export default function AboutScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
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
  }, []);

  const workflowSteps = [
    { icon: '📚', title: 'Literature Review', desc: 'Existing research analysis' },
    { icon: '📊', title: 'Dataset Understanding', desc: 'GNPC V1 Harmonized' },
    { icon: '⚙️', title: 'Data Preprocessing', desc: 'Integration & cleaning' },
    { icon: '🎯', title: 'Feature Selection', desc: 'RF + LASSO methods' },
    { icon: '🧠', title: 'FNN Model', desc: 'Deep learning classifier' },
    { icon: '📈', title: 'Evaluation', desc: 'Performance metrics' },
    { icon: '🧬', title: 'Biomarker ID', desc: 'Biological validation' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#0A1628', '#1A2D4A']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>About</Text>
          
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Project Title */}
        <Animated.View
          style={[
            styles.titleCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.titleGradient}
          >
            <Text style={styles.projectEmoji}>🧠</Text>
            <Text style={styles.projectTitle}>NeuroDetect AI</Text>
            <Text style={styles.projectSubtitle}>
              Early Parkinson's Disease Detection and Biomarker Identification Using Proteomic Data
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Problem Statement */}
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
            <Ionicons name="alert-circle" size={24} color={COLORS.danger} />
            <Text style={styles.sectionTitle}>Problem Statement</Text>
          </View>
          <View style={styles.sectionCard}>
            <Text style={styles.problemText}>
              Parkinson's Disease (PD) often remains undiagnosed until visible motor symptoms appear, 
              reducing treatment effectiveness. This project develops a deep learning model using GNPC V1 
              plasma proteomic data to distinguish PD from healthy controls and identify key protein 
              biomarkers, enabling early, pre-symptomatic detection.
            </Text>
          </View>
        </Animated.View>

        {/* Dataset Info */}
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
            <Ionicons name="server" size={24} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>GNPC V1 Dataset</Text>
          </View>
          <View style={styles.sectionCard}>
            <View style={styles.datasetGrid}>
              <View style={styles.datasetItem}>
                <Text style={styles.datasetValue}>
                  {DATASET_STATS.participants.toLocaleString()}
                </Text>
                <Text style={styles.datasetLabel}>Participants</Text>
              </View>
              <View style={styles.datasetItem}>
                <Text style={styles.datasetValue}>{DATASET_STATS.cohorts}</Text>
                <Text style={styles.datasetLabel}>Cohorts</Text>
              </View>
              <View style={styles.datasetItem}>
                <Text style={styles.datasetValue}>
                  {DATASET_STATS.bioSamples.toLocaleString()}
                </Text>
                <Text style={styles.datasetLabel}>Bio Samples</Text>
              </View>
              <View style={styles.datasetItem}>
                <Text style={styles.datasetValue}>{DATASET_STATS.clinicalFeatures}</Text>
                <Text style={styles.datasetLabel}>Features</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <Text style={styles.datasetDescription}>
              Comprehensive multicohort proteomic dataset with {DATASET_STATS.proteinMeasurements} protein 
              measurements from plasma, serum, and CSF samples using SomaScan platforms (7K, 5K, 1.3K).
            </Text>
          </View>
        </Animated.View>

        {/* Research Workflow */}
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
            <Ionicons name="git-branch" size={24} color="#667EEA" />
            <Text style={styles.sectionTitle}>Research Workflow</Text>
          </View>
          <View style={styles.workflowContainer}>
            {workflowSteps.map((step, index) => (
              <View key={index} style={styles.workflowStep}>
                <View style={styles.workflowIconContainer}>
                  <Text style={styles.workflowIcon}>{step.icon}</Text>
                </View>
                <View style={styles.workflowContent}>
                  <Text style={styles.workflowTitle}>{step.title}</Text>
                  <Text style={styles.workflowDesc}>{step.desc}</Text>
                </View>
                {index < workflowSteps.length - 1 && (
                  <View style={styles.workflowConnector} />
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Model Architecture */}
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
            <Ionicons name="cube" size={24} color="#F5576C" />
            <Text style={styles.sectionTitle}>Model Architecture</Text>
          </View>
          <View style={styles.sectionCard}>
            <View style={styles.architectureRow}>
              <View style={styles.architectureItem}>
                <Text style={styles.architectureLabel}>Model Type</Text>
                <Text style={styles.architectureValue}>
                  Feedforward Neural Network (FNN)
                </Text>
              </View>
            </View>
            <View style={styles.architectureRow}>
              <View style={styles.architectureItem}>
                <Text style={styles.architectureLabel}>Feature Selection</Text>
                <Text style={styles.architectureValue}>Random Forest + LASSO</Text>
              </View>
            </View>
            <View style={styles.architectureRow}>
              <View style={styles.architectureItem}>
                <Text style={styles.architectureLabel}>Task</Text>
                <Text style={styles.architectureValue}>Binary Classification (PD vs Control)</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Clinical Features */}
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
            <Ionicons name="list" size={24} color="#FFB800" />
            <Text style={styles.sectionTitle}>Clinical Features</Text>
          </View>
          <View style={styles.sectionCard}>
            <View style={styles.featureCategory}>
              <Text style={styles.featureCategoryTitle}>Demographics & Lifestyle</Text>
              <Text style={styles.featureCategoryItems}>
                Age, Sex, Race, Education, Smoking/Alcohol History
              </Text>
            </View>
            <View style={styles.featureCategory}>
              <Text style={styles.featureCategoryTitle}>Vitals & Physical</Text>
              <Text style={styles.featureCategoryItems}>
                BMI, Blood Pressure, Resting Pulse
              </Text>
            </View>
            <View style={styles.featureCategory}>
              <Text style={styles.featureCategoryTitle}>Comorbidities</Text>
              <Text style={styles.featureCategoryItems}>
                Stroke, TBI, Diabetes, COPD, Hypertension, Depression
              </Text>
            </View>
            <View style={styles.featureCategory}>
              <Text style={styles.featureCategoryTitle}>Clinical & Cognitive</Text>
              <Text style={styles.featureCategoryItems}>
                Cognitive Test Score, CDR, Clinical Diagnosis
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Disclaimer */}
        <Animated.View
          style={[
            styles.disclaimer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Ionicons name="warning" size={20} color={COLORS.warning} />
          <Text style={styles.disclaimerText}>
            This application is for research and educational purposes only. 
            It is not intended to replace professional medical diagnosis. 
            Always consult healthcare professionals for clinical decisions.
          </Text>
        </Animated.View>

        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>NeuroDetect AI v1.0.0</Text>
          <Text style={styles.copyrightText}>
            Built with Deep Learning & Proteomics
          </Text>
          <Text style={styles.developerText}>
            Designed and Developed by Manav Rai
          </Text>
          <Text style={styles.rightsText}>
            All Rights Reserved
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  titleCard: {
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    marginBottom: SIZES.xl,
    ...SHADOWS.large,
  },
  titleGradient: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  projectEmoji: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  projectTitle: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: SIZES.sm,
  },
  projectSubtitle: {
    fontSize: SIZES.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: SIZES.sm,
  },
  sectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  problemText: {
    fontSize: SIZES.regular,
    color: COLORS.darkGray,
    lineHeight: 24,
  },
  datasetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SIZES.md,
  },
  datasetItem: {
    width: '50%',
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  datasetValue: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.accent,
  },
  datasetLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGray,
    marginVertical: SIZES.md,
  },
  datasetDescription: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  workflowContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  workflowIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  workflowIcon: {
    fontSize: 20,
  },
  workflowContent: {
    flex: 1,
  },
  workflowTitle: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
  },
  workflowDesc: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  workflowConnector: {
    position: 'absolute',
    left: 21,
    top: 48,
    width: 2,
    height: 20,
    backgroundColor: COLORS.lightGray,
  },
  architectureRow: {
    marginBottom: SIZES.md,
  },
  architectureItem: {},
  architectureLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.xs,
  },
  architectureValue: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
  },
  featureCategory: {
    marginBottom: SIZES.md,
  },
  featureCategoryTitle: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  featureCategoryItems: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 20,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: COLORS.warning + '15',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.xl,
  },
  disclaimerText: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginLeft: SIZES.sm,
    lineHeight: 18,
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  versionText: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.primary,
  },
  copyrightText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  developerText: {
    fontSize: SIZES.regular,
    color: COLORS.primary,
    marginTop: SIZES.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  rightsText: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginTop: SIZES.xs,
    textAlign: 'center',
    fontWeight: '500',
  },
  bottomPadding: {
    height: SIZES.xl,
  },
});

