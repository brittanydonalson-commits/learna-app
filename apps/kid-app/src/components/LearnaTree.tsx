import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Easing } from 'react-native';

interface LearnaTreeProps {
  // Tree states: 'idle', 'listening', 'speaking', 'thinking', 'happy', 'sad'
  state?: 'idle' | 'listening' | 'speaking' | 'thinking' | 'happy' | 'sad';
  size?: number;
}

export const LearnaTree: React.FC<LearnaTreeProps> = ({
  state = 'idle',
  size = 200,
}) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const swayAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset animations
    bounceAnim.setValue(0);
    swayAnim.setValue(0);
    glowAnim.setValue(0);

    switch (state) {
      case 'listening':
        // Gentle breathing/pulsing
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 1500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'speaking':
        // Active bobbing
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 300,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        
        // Glow effect
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'thinking':
        // Slow sway
        Animated.loop(
          Animated.sequence([
            Animated.timing(swayAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(swayAnim, {
              toValue: -1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'happy':
        // Bouncy and glowing
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        ).start();
        
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        break;

      case 'sad':
        // Droopy - slow, minimal movement
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 0.2,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'idle':
      default:
        // Gentle idle breathing
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: 0.3,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 2500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }
  }, [state, bounceAnim, swayAnim, glowAnim]);

  const treeColor = state === 'sad' ? '#4a6741' : '#2d5a27';
  const trunkColor = '#5d4037';
  const leafColor = state === 'happy' ? '#4caf50' : treeColor;

  return (
    <View style={[styles.container, { width: size, height: size * 1.5 }]}>
      <Animated.View
        style={[
          styles.tree,
          {
            transform: [
              { scale: 1 + bounceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.1],
              })},
              { rotate: swayAnim.interpolate({
                inputRange: [-1, 1],
                outputRange: ['-3deg', '3deg'],
              })},
            ],
          },
        ]}
      >
        {/* Tree foliage (simplified) */}
        <View
          style={[
            styles.foliage,
            {
              backgroundColor: leafColor,
              width: size * 0.8,
              height: size * 0.8,
              borderRadius: size * 0.4,
              opacity: 0.8 + glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.2],
              }),
            },
          ]}
        >
          {/* Face */}
          <View style={styles.face}>
            {/* Eyes */}
            <View style={styles.eyes}>
              <View style={[styles.eye, state === 'sad' && styles.eyeSad]} />
              <View style={[styles.eye, state === 'sad' && styles.eyeSad]} />
            </View>
            {/* Mouth */}
            <View
              style={[
                styles.mouth,
                state === 'happy' && styles.mouthHappy,
                state === 'sad' && styles.mouthSad,
                state === 'listening' && styles.mouthListening,
                state === 'speaking' && styles.mouthSpeaking,
              ]}
            />
          </View>
        </View>
        
        {/* Trunk */}
        <View
          style={[
            styles.trunk,
            {
              backgroundColor: trunkColor,
              width: size * 0.2,
              height: size * 0.5,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tree: {
    alignItems: 'center',
  },
  foliage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    alignItems: 'center',
  },
  eyes: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  eye: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#1a3d12',
  },
  eyeSad: {
    transform: [{ rotate: '20deg' }],
  },
  mouth: {
    width: 30,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1a3d12',
  },
  mouthHappy: {
    height: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    backgroundColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: '#1a3d12',
    width: 40,
  },
  mouthSad: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: 15,
    backgroundColor: 'transparent',
    borderTopWidth: 4,
    borderTopColor: '#1a3d12',
    width: 30,
  },
  mouthListening: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  mouthSpeaking: {
    width: 35,
    height: 15,
    borderRadius: 8,
  },
  trunk: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
});