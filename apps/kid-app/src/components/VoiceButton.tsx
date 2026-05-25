import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';

interface VoiceButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  isRecording,
  isProcessing,
  onPressIn,
  onPressOut,
  disabled = false,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rippleAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isRecording) {
      // Pulse animation when recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Ripple effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      rippleAnim.setValue(0);
    }
  }, [isRecording, pulseAnim, rippleAnim]);

  const buttonColor = isRecording
    ? '#ef5350'
    : isProcessing
    ? '#ffa726'
    : '#66bb6a';

  const buttonText = isRecording
    ? 'Release to stop'
    : isProcessing
    ? 'Thinking...'
    : 'Hold to talk';

  return (
    <View style={styles.container}>
      {/* Ripple effect */}
      {isRecording && (
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: buttonColor,
              transform: [
                {
                  scale: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                },
              ],
              opacity: rippleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.5, 0],
              }),
            },
          ]}
        />
      )}

      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          disabled={disabled || isProcessing}
          activeOpacity={0.8}
        >
          <View style={styles.micIcon}>
            {/* Microphone icon (simplified) */}
            <View style={styles.micBody} />
            <View style={styles.micBase} />
            <View style={styles.micStand} />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.text}>{buttonText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micIcon: {
    alignItems: 'center',
  },
  micBody: {
    width: 24,
    height: 36,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  micBase: {
    width: 36,
    height: 18,
    borderWidth: 4,
    borderColor: '#fff',
    borderTopWidth: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: -4,
  },
  micStand: {
    width: 4,
    height: 10,
    backgroundColor: '#fff',
    marginTop: 2,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});