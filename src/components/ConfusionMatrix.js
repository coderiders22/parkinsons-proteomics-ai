import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function ConfusionMatrix({ 
  trueHealthy = 297,
  falseNegative = 4,
  falsePositive = 16,
  truePD = 118 
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      ...scaleAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          delay: 200 + index * 100,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  const total = trueHealthy + falseNegative + falsePositive + truePD;
  const maxValue = Math.max(trueHealthy, falseNegative, falsePositive, truePD);

  const getIntensity = (value) => {
    return (value / maxValue) * 0.9 + 0.1;
  };

  const MatrixCell = ({ label, value, isDiagonal, delay }) => {
    const intensity = getIntensity(value);
    const scaleAnim = scaleAnims[delay];

    return (
      <Animated.View
        style={[
          styles.cell,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
            backgroundColor: isDiagonal
              ? `rgba(0, 212, 170, ${intensity * 0.3})`
              : `rgba(245, 87, 108, ${intensity * 0.3})`,
          },
        ]}
      >
        <LinearGradient
          colors={
            isDiagonal
              ? [
                  `rgba(0, 212, 170, ${intensity * 0.4})`,
                  `rgba(0, 212, 170, ${intensity * 0.2})`,
                ]
              : [
                  `rgba(245, 87, 108, ${intensity * 0.4})`,
                  `rgba(245, 87, 108, ${intensity * 0.2})`,
                ]
          }
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.cellValue}>{value}</Text>
        <Text style={styles.cellLabel}>{label}</Text>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Confusion Matrix (Test set)</Text>
        <Text style={styles.subtitle}>
          The model correctly classified {trueHealthy} healthy samples and {truePD} PD samples,
          with only {falseNegative + falsePositive} misclassifications in total.
        </Text>
      </View>

      <View style={styles.matrixContainer}>
        {/* Column Headers */}
        <View style={styles.headerRow}>
          <View style={styles.cornerCell} />
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>Healthy</Text>
          </View>
          <View style={styles.headerCell}>
            <Text style={styles.headerText}>PD</Text>
          </View>
        </View>

        {/* Row 1: True Healthy */}
        <View style={styles.matrixRow}>
          <View style={styles.rowHeaderCell}>
            <Text style={styles.rowHeaderText}>Healthy</Text>
          </View>
          <MatrixCell
            label="True Positive"
            value={trueHealthy}
            isDiagonal={true}
            delay={0}
          />
          <MatrixCell
            label="False Negative"
            value={falseNegative}
            isDiagonal={false}
            delay={1}
          />
        </View>

        {/* Row 2: True PD */}
        <View style={styles.matrixRow}>
          <View style={styles.rowHeaderCell}>
            <Text style={styles.rowHeaderText}>PD</Text>
          </View>
          <MatrixCell
            label="False Positive"
            value={falsePositive}
            isDiagonal={false}
            delay={2}
          />
          <MatrixCell
            label="True Positive"
            value={truePD}
            isDiagonal={true}
            delay={3}
          />
        </View>
      </View>

      {/* Metrics Summary */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{trueHealthy + truePD}</Text>
          <Text style={styles.metricLabel}>Correct</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{falseNegative + falsePositive}</Text>
          <Text style={styles.metricLabel}>Incorrect</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>
            {(((trueHealthy + truePD) / total) * 100).toFixed(1)}%
          </Text>
          <Text style={styles.metricLabel}>Accuracy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.lg,
  },
  header: {
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    lineHeight: 20,
    paddingRight: SIZES.xs,
  },
  matrixContainer: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: SIZES.xs,
  },
  cornerCell: {
    width: 80,
    height: 40,
  },
  headerCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: SIZES.xs,
  },
  headerText: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matrixRow: {
    flexDirection: 'row',
    marginBottom: SIZES.xs,
  },
  rowHeaderCell: {
    width: 80,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xs,
  },
  rowHeaderText: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cell: {
    flex: 1,
    height: 100,
    marginHorizontal: SIZES.xs,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    overflow: 'hidden',
  },
  cellValue: {
    fontSize: SIZES.xxlarge,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  cellLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.darkGray,
    textAlign: 'center',
    fontWeight: '600',
    paddingHorizontal: SIZES.xs,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: SIZES.lg,
    paddingTop: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: SIZES.xlarge,
    fontWeight: '800',
    color: COLORS.accent,
    marginBottom: SIZES.xs,
  },
  metricLabel: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.lightGray,
  },
});

