import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function InteractiveBiomarkerChart({ biomarkers, onBiomarkerPress }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const barAnims = useRef(biomarkers.map(() => new Animated.Value(0))).current;
  const detailAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate bars in sequence (using native driver with scaleX)
    barAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: biomarkers[index].importance,
        duration: 1500,
        delay: index * 100,
        useNativeDriver: true, // Using scaleX transform instead of width
      }).start();
    });
  }, []);

  useEffect(() => {
    Animated.timing(detailAnim, {
      toValue: selectedIndex !== null ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex]);

  const handlePress = (index, biomarker) => {
    setSelectedIndex(selectedIndex === index ? null : index);
    if (onBiomarkerPress) {
      onBiomarkerPress(biomarker);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Biomarker Importance Analysis</Text>
      
      {biomarkers.map((biomarker, index) => {
        const isSelected = selectedIndex === index;
        const barScale = barAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        });

        return (
          <TouchableOpacity
            key={biomarker.id}
            activeOpacity={0.8}
            onPress={() => handlePress(index, biomarker)}
            style={styles.barContainer}
          >
            <View style={styles.barRow}>
              <View style={styles.barInfo}>
                <Text style={styles.barLabel}>{biomarker.name}</Text>
                <Text style={styles.barSymbol}>{biomarker.symbol}</Text>
              </View>
              <View style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  <Animated.View
                    style={[
                      styles.barFill,
                      {
                        transform: [{ scaleX: barScale }],
                        backgroundColor: isSelected ? COLORS.accentLight : COLORS.accent,
                      },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? [COLORS.accentLight, COLORS.accent]
                          : [COLORS.accent, COLORS.accentDark]
                      }
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </Animated.View>
                </View>
                <Text style={styles.barValue}>
                  {(biomarker.importance * 100).toFixed(0)}%
                </Text>
              </View>
            </View>

            {isSelected && (
              <Animated.View
                style={[
                  styles.detailCard,
                  {
                    opacity: detailAnim,
                    transform: [
                      {
                        translateY: detailAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.detailCategory}>{biomarker.category}</Text>
                <Text style={styles.detailDescription}>{biomarker.description}</Text>
                <View style={styles.detailBadge}>
                  <Text style={styles.detailBadgeText}>
                    {biomarker.direction === 'elevated' ? '↑ Elevated' : '↓ Decreased'}
                  </Text>
                </View>
              </Animated.View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.lg,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: SIZES.large,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SIZES.xl,
    letterSpacing: -0.5,
    paddingHorizontal: SIZES.xs,
  },
  barContainer: {
    marginBottom: SIZES.md,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  barInfo: {
    width: 120,
  },
  barLabel: {
    fontSize: SIZES.regular,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  barSymbol: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  barWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  barBackground: {
    flex: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SIZES.sm,
  },
  barFill: {
    height: '100%',
    width: '100%',
    borderRadius: 12,
  },
  barValue: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.accent,
    width: 45,
    textAlign: 'right',
  },
  detailCard: {
    marginTop: SIZES.sm,
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailCategory: {
    fontSize: SIZES.small,
    fontWeight: '700',
    color: COLORS.accent,
    marginBottom: SIZES.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailDescription: {
    fontSize: SIZES.regular,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: SIZES.sm,
  },
  detailBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    backgroundColor: 'rgba(0, 212, 170, 0.2)',
    borderRadius: SIZES.radiusSm,
  },
  detailBadgeText: {
    fontSize: SIZES.tiny,
    fontWeight: '700',
    color: COLORS.accent,
  },
});

