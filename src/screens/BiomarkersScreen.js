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
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { BIOMARKERS } from '../constants/data';
import InteractiveBiomarkerChart from '../components/InteractiveBiomarkerChart';
import GlassmorphicCard from '../components/GlassmorphicCard';

const { width } = Dimensions.get('window');

export default function BiomarkersScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(BIOMARKERS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Staggered card animations
    cardAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 500,
        delay: 200 + index * 80,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      'Protein Aggregation': '#FF6B6B',
      'Neurodegeneration': '#667EEA',
      'Oxidative Stress': '#FFB800',
      'Lysosomal Function': '#00D4AA',
      'Neuroprotection': '#F093FB',
      'Antioxidant': '#4FACFE',
      'Lipid Metabolism': '#764BA2',
      'Inflammation': '#F5576C',
    };
    return colors[category] || COLORS.accent;
  };

  const getDirectionIcon = (direction) => {
    return direction === 'elevated' ? 'arrow-up' : 'arrow-down';
  };

  const getDirectionColor = (direction) => {
    return direction === 'elevated' ? COLORS.danger : COLORS.success;
  };

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
          
          <View style={styles.headerTitle}>
            <Text style={styles.headerTitleText}>Biomarkers</Text>
            <Text style={styles.headerSubtitle}>Key PD Indicators</Text>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        {/* Header Stats */}
        <Animated.View style={[styles.headerStats, { opacity: fadeAnim }]}>
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>{BIOMARKERS.length}</Text>
            <Text style={styles.headerStatLabel}>Biomarkers</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>RF+LASSO</Text>
            <Text style={styles.headerStatLabel}>Selection</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStatItem}>
            <Text style={styles.headerStatValue}>FNN</Text>
            <Text style={styles.headerStatLabel}>Model</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Interactive Biomarker Chart */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: SIZES.lg }}>
          <GlassmorphicCard variant="light" style={styles.chartCard}>
            <InteractiveBiomarkerChart
              biomarkers={BIOMARKERS}
              onBiomarkerPress={(biomarker) => {
                // Scroll to biomarker or show details
              }}
            />
          </GlassmorphicCard>
        </Animated.View>

        {/* Info Card */}
        <Animated.View style={[styles.infoCard, { opacity: fadeAnim }]}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color={COLORS.accent} />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>About Biomarkers</Text>
            <Text style={styles.infoText}>
              These biomarkers were identified using Random Forest feature importance 
              and LASSO regularization on the GNPC V1 proteomic dataset.
            </Text>
          </View>
        </Animated.View>

        {/* Biomarker Cards */}
        {BIOMARKERS.map((biomarker, index) => (
          <Animated.View
            key={biomarker.id}
            style={[
              styles.biomarkerCard,
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
            {/* Rank Badge */}
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>

            {/* Main Content */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.biomarkerName}>{biomarker.name}</Text>
                <View
                  style={[
                    styles.directionBadge,
                    { backgroundColor: getDirectionColor(biomarker.direction) + '20' },
                  ]}
                >
                  <Ionicons
                    name={getDirectionIcon(biomarker.direction)}
                    size={14}
                    color={getDirectionColor(biomarker.direction)}
                  />
                  <Text
                    style={[
                      styles.directionText,
                      { color: getDirectionColor(biomarker.direction) },
                    ]}
                  >
                    {biomarker.direction}
                  </Text>
                </View>
              </View>
              <View style={styles.symbolRow}>
                <Text style={styles.biomarkerSymbol}>{biomarker.symbol}</Text>
                <View
                  style={[
                    styles.categoryBadge,
                    { backgroundColor: getCategoryColor(biomarker.category) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      { color: getCategoryColor(biomarker.category) },
                    ]}
                  >
                    {biomarker.category}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.biomarkerDescription}>
              {biomarker.description}
            </Text>

            {/* Importance Bar */}
            <View style={styles.importanceSection}>
              <View style={styles.importanceHeader}>
                <Text style={styles.importanceLabel}>Feature Importance</Text>
                <Text style={styles.importanceValue}>
                  {(biomarker.importance * 100).toFixed(0)}%
                </Text>
              </View>
              <View style={styles.importanceBarContainer}>
                <Animated.View
                  style={[
                    styles.importanceBarFill,
                    {
                      transform: [{ 
                        scaleX: cardAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, biomarker.importance],
                        })
                      }],
                      backgroundColor: getCategoryColor(biomarker.category),
                    },
                  ]}
                />
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Research Note */}
        <Animated.View style={[styles.researchNote, { opacity: fadeAnim }]}>
          <Text style={styles.researchNoteEmoji}>🔬</Text>
          <Text style={styles.researchNoteTitle}>Research Note</Text>
          <Text style={styles.researchNoteText}>
            Feature selection was performed using a combination of Random Forest 
            importance scores and LASSO (L1 regularization) to identify the most 
            predictive protein biomarkers for Parkinson's Disease classification.
          </Text>
        </Animated.View>

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
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  backButton: {
    padding: SIZES.sm,
    marginLeft: -SIZES.sm,
  },
  headerTitle: {
    alignItems: 'center',
  },
  headerTitleText: {
    fontSize: SIZES.large,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  placeholder: {
    width: 40,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
  },
  headerStatItem: {
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: SIZES.medium,
    fontWeight: '800',
    color: COLORS.accent,
  },
  headerStatLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.lg,
  },
  chartCard: {
    marginBottom: SIZES.lg,
    padding: 0,
    overflow: 'hidden',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: SIZES.regular,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    lineHeight: 18,
  },
  biomarkerCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    marginBottom: SIZES.lg,
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  rankBadge: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  rankNumber: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardHeader: {
    marginBottom: SIZES.md,
    paddingRight: SIZES.xxl,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  biomarkerName: {
    fontSize: SIZES.medium,
    fontWeight: '800',
    color: COLORS.primary,
    flex: 1,
    letterSpacing: -0.3,
  },
  directionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  directionText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
    marginLeft: SIZES.xs,
    textTransform: 'capitalize',
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biomarkerSymbol: {
    fontSize: SIZES.regular,
    color: COLORS.accent,
    fontWeight: '600',
    marginRight: SIZES.sm,
  },
  categoryBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  categoryText: {
    fontSize: SIZES.tiny,
    fontWeight: '600',
  },
  biomarkerDescription: {
    fontSize: SIZES.regular,
    color: COLORS.darkGray,
    lineHeight: 24,
    marginBottom: SIZES.md,
    letterSpacing: 0.1,
  },
  importanceSection: {
    backgroundColor: COLORS.offWhite,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  importanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  importanceLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  importanceValue: {
    fontSize: SIZES.regular,
    fontWeight: '700',
    color: COLORS.primary,
  },
  importanceBarContainer: {
    height: 8,
    backgroundColor: COLORS.lightGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  importanceBarFill: {
    height: '100%',
    width: '100%',
    borderRadius: 4,
  },
  researchNote: {
    backgroundColor: COLORS.primary + '10',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  researchNoteEmoji: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  researchNoteTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  researchNoteText: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomPadding: {
    height: SIZES.xl,
  },
});

