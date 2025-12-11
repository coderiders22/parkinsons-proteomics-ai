import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function DataFlowVisualization({ active = true }) {
  const flowAnims = useRef(
    Array.from({ length: 8 }, () => ({
      position: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!active) return;

    flowAnims.forEach((flow, index) => {
      // Reset and start flow animation
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(flow.position, {
              toValue: 1,
              duration: 2000,
              easing: Easing.linear,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(flow.opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(flow.opacity, {
                toValue: 0,
                duration: 300,
                delay: 1400,
                useNativeDriver: true,
              }),
            ]),
          ]),
          Animated.timing(flow.position, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [active]);

  const paths = [
    { start: { x: 50, y: 50 }, end: { x: width - 50, y: 100 } },
    { start: { x: 50, y: 100 }, end: { x: width - 50, y: 150 } },
    { start: { x: 50, y: 150 }, end: { x: width - 50, y: 200 } },
    { start: { x: 50, y: 200 }, end: { x: width - 50, y: 250 } },
  ];

  return (
    <View style={styles.container}>
      {paths.map((path, index) => {
        const flow = flowAnims[index % flowAnims.length];
        const translateX = flow.position.interpolate({
          inputRange: [0, 1],
          outputRange: [path.start.x, path.end.x],
        });
        const translateY = flow.position.interpolate({
          inputRange: [0, 1],
          outputRange: [path.start.y, path.end.y],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.dataPoint,
              {
                transform: [{ translateX }, { translateY }],
                opacity: flow.opacity,
              },
            ]}
          >
            <View style={styles.dataPointInner} />
            <View style={styles.dataPointGlow} />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 300,
    position: 'relative',
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
  },
  dataPointInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  dataPointGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    opacity: 0.4,
    top: -4,
    left: -4,
  },
});

