import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function AdvancedNeuralNetwork({ active = true }) {
  const nodeAnims = useRef(
    Array.from({ length: 30 }, () => ({
      pulse: new Animated.Value(0.5),
      glow: new Animated.Value(0),
      delay: Math.random() * 2000,
    }))
  ).current;

  const connectionAnims = useRef(
    Array.from({ length: 20 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    if (!active) return;

    // Staggered node pulse animations
    nodeAnims.forEach((node, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(node.delay),
          Animated.parallel([
            Animated.timing(node.pulse, {
              toValue: 1,
              duration: 1000 + Math.random() * 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(node.glow, {
              toValue: 1,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(node.pulse, {
              toValue: 0.5,
              duration: 1000 + Math.random() * 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(node.glow, {
              toValue: 0,
              duration: 800,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    // Connection line animations
    connectionAnims.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  }, [active]);

  const layers = [
    { nodes: 4, x: width * 0.15 },
    { nodes: 8, x: width * 0.35 },
    { nodes: 6, x: width * 0.55 },
    { nodes: 4, x: width * 0.75 },
    { nodes: 2, x: width * 0.9 },
  ];

  return (
    <View style={styles.container}>
      {layers.map((layer, layerIndex) => (
        <View key={layerIndex} style={[styles.layer, { left: layer.x }]}>
          {Array.from({ length: layer.nodes }).map((_, nodeIndex) => {
            const globalIndex = layers
              .slice(0, layerIndex)
              .reduce((sum, l) => sum + l.nodes, 0) + nodeIndex;
            const nodeAnim = nodeAnims[globalIndex % nodeAnims.length];
            
            return (
              <Animated.View
                key={nodeIndex}
                style={[
                  styles.node,
                  {
                    top: (nodeIndex * 40) + 20,
                    transform: [
                      { scale: nodeAnim.pulse },
                    ],
                    opacity: nodeAnim.pulse.interpolate({
                      inputRange: [0.5, 1],
                      outputRange: [0.6, 1],
                    }),
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.nodeGlow,
                    {
                      opacity: nodeAnim.glow,
                      transform: [
                        { scale: nodeAnim.glow.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 1.5],
                        })},
                      ],
                    },
                  ]}
                />
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 200,
    position: 'relative',
  },
  layer: {
    position: 'absolute',
    width: 40,
    height: '100%',
  },
  node: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 5,
  },
  nodeGlow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    opacity: 0.3,
  },
});

