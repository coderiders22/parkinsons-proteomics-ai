import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';
import CustomLineChart from './CustomLineChart';

const { width } = Dimensions.get('window');
const chartWidth = width - SIZES.lg * 4;

// Simulated training data based on the images
const generateAUCData = () => {
  const iterations = [];
  const trainAUC = [];
  const validAUC = [];
  
  for (let i = 0; i <= 700; i += 10) {
    iterations.push(i);
    // Train AUC: starts at 0.88, rapidly increases to ~0.998, stabilizes near 1.0
    const train = i < 100 
      ? 0.88 + (i / 100) * 0.1
      : 0.98 + Math.min(0.018, (i - 100) / 600 * 0.018);
    trainAUC.push(Math.min(1.0, train));
    
    // Valid AUC: starts at 0.88, increases to ~0.96, stabilizes around 0.978
    const valid = i < 100
      ? 0.88 + (i / 100) * 0.08
      : 0.96 + Math.min(0.018, (i - 100) / 300 * 0.018);
    validAUC.push(Math.min(0.98, valid));
  }
  
  return { iterations, trainAUC, validAUC };
};

const generateLoglossData = () => {
  const iterations = [];
  const trainLoss = [];
  const validLoss = [];
  
  for (let i = 0; i <= 700; i += 10) {
    iterations.push(i);
    // Train Loss: starts at 0.6, decreases smoothly to near 0.0
    trainLoss.push(Math.max(0, 0.6 * Math.exp(-i / 150)));
    
    // Valid Loss: starts at 0.6, decreases and stabilizes around 0.15
    validLoss.push(Math.max(0.15, 0.6 * Math.exp(-i / 200)));
  }
  
  return { iterations, trainLoss, validLoss };
};

export default function TrainingCurves() {
  const [activeTab, setActiveTab] = useState('auc');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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

  const aucData = generateAUCData();
  const loglossData = generateLoglossData();

  const renderAUCChart = () => {
    // Sample data points for performance
    const sampleStep = Math.ceil(aucData.iterations.length / 50);
    const sampledIterations = aucData.iterations.filter((_, i) => i % sampleStep === 0);
    const sampledTrainAUC = aucData.trainAUC.filter((_, i) => i % sampleStep === 0);
    const sampledValidAUC = aucData.validAUC.filter((_, i) => i % sampleStep === 0);

    const chartData = [
      {
        data: sampledTrainAUC,
        xValues: sampledIterations,
        color: '#3B82F6',
        strokeWidth: 2,
      },
      {
        data: sampledValidAUC,
        xValues: sampledIterations,
        color: '#F59E0B',
        strokeWidth: 2,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>AUC vs Iterations</Text>
        <CustomLineChart
          data={chartData}
          width={chartWidth}
          height={220}
          yMin={0.88}
          yMax={1.0}
          xMin={0}
          xMax={700}
          xLabel="Iteration"
          yLabel="AUC"
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Train AUC (training)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Valid AUC (valid_1)</Text>
          </View>
        </View>
        <Text style={styles.caption}>
          Figure 8: AUC vs iterations for training and validation sets.
        </Text>
        <Text style={styles.description}>
          The validation AUC stabilizes around 0.978, indicating good optimization and minimal overfitting.
        </Text>
      </View>
    );
  };

  const renderLoglossChart = () => {
    // Sample data points for performance
    const sampleStep = Math.ceil(loglossData.iterations.length / 50);
    const sampledIterations = loglossData.iterations.filter((_, i) => i % sampleStep === 0);
    const sampledTrainLoss = loglossData.trainLoss.filter((_, i) => i % sampleStep === 0);
    const sampledValidLoss = loglossData.validLoss.filter((_, i) => i % sampleStep === 0);

    const chartData = [
      {
        data: sampledTrainLoss,
        xValues: sampledIterations,
        color: '#3B82F6',
        strokeWidth: 2,
      },
      {
        data: sampledValidLoss,
        xValues: sampledIterations,
        color: '#F59E0B',
        strokeWidth: 2,
      },
    ];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Binary Logloss vs Iterations</Text>
        <CustomLineChart
          data={chartData}
          width={chartWidth}
          height={220}
          yMin={0.0}
          yMax={0.6}
          xMin={0}
          xMax={700}
          xLabel="Iteration"
          yLabel="Binary Logloss"
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={styles.legendText}>Train Loss (training)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={styles.legendText}>Valid Loss (valid_1)</Text>
          </View>
        </View>
        <Text style={styles.caption}>
          Figure 9: Binary logloss vs iterations for training and validation sets.
        </Text>
        <Text style={styles.description}>
          The validation logloss converges smoothly, indicating good optimization and minimal overfitting.
        </Text>
      </View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Training Curves</Text>
        <Text style={styles.subtitle}>
          Figures 8 and 9 illustrate the AUC and logloss evolution across training iterations.
        </Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'auc' && styles.activeTab]}
          onPress={() => setActiveTab('auc')}
        >
          <Text style={[styles.tabText, activeTab === 'auc' && styles.activeTabText]}>
            AUC
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'logloss' && styles.activeTab]}
          onPress={() => setActiveTab('logloss')}
        >
          <Text style={[styles.tabText, activeTab === 'logloss' && styles.activeTabText]}>
            Logloss
          </Text>
        </TouchableOpacity>
      </View>

      {/* Chart Container */}
      <View style={styles.chartWrapper}>
        {activeTab === 'auc' ? renderAUCChart() : renderLoglossChart()}
      </View>
    </Animated.View>
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.offWhite,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.xs,
    marginBottom: SIZES.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderRadius: SIZES.radiusSm,
  },
  activeTab: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: SIZES.regular,
    fontWeight: '600',
    color: COLORS.gray,
  },
  activeTabText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  chartWrapper: {
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
  chartContainer: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: SIZES.medium,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SIZES.md,
    textAlign: 'center',
  },
  chart: {
    marginVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.md,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.xs,
  },
  legendText: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '600',
  },
  caption: {
    fontSize: SIZES.tiny,
    color: COLORS.gray,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  description: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginTop: SIZES.xs,
    lineHeight: 18,
  },
});

