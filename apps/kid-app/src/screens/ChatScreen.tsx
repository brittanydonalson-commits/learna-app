import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LearnaTree } from '../components/LearnaTree';
import { VoiceButton } from '../components/VoiceButton';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { Child } from '../types';
import { stopSpeaking } from '../services/speech';

type TreeState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'happy' | 'sad';

interface ChatScreenProps {
  child: Child;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ child }) => {
  const [treeState, setTreeState] = useState<TreeState>('idle');
  const [lastChildMessage, setLastChildMessage] = useState('');
  
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    interrupt,
  } = useVoiceChat(child);

  // Update tree state based on recording/processing
  useEffect(() => {
    if (isRecording) {
      setTreeState('listening');
    } else if (isProcessing) {
      setTreeState('thinking');
    } else {
      setTreeState('idle');
    }
  }, [isRecording, isProcessing]);

  // Handle press in - start recording
  const handlePressIn = async () => {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  // Handle press out - stop recording and process
  const handlePressOut = async () => {
    try {
      await stopRecording();
      // In production, would get transcribed text here
      // For demo, simulate with a placeholder or voice input
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  // Handle interrupting Learna
  const handleInterrupt = async () => {
    await interrupt();
    setTreeState('idle');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a472a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {child.name}! 👋</Text>
        <TouchableOpacity onPress={handleInterrupt} style={styles.interruptButton}>
          <Text style={styles.interruptText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Learna Tree */}
      <View style={styles.treeContainer}>
        <LearnaTree state={treeState} size={200} />
      </View>

      {/* Status text */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {isRecording
            ? 'I\'m listening...'
            : isProcessing
            ? 'Hmm, let me think...'
            : treeState === 'happy'
            ? 'That was fun!'
            : 'Tap and talk to me!'}
        </Text>
      </View>

      {/* Last message preview */}
      {lastChildMessage ? (
        <View style={styles.messagePreview}>
          <Text style={styles.messagePreviewText} numberOfLines={2}>
            You said: "{lastChildMessage}"
          </Text>
        </View>
      ) : null}

      {/* Voice Button */}
      <View style={styles.voiceButtonContainer}>
        <VoiceButton
          isRecording={isRecording}
          isProcessing={isProcessing}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  interruptButton: {
    padding: 10,
  },
  interruptText: {
    color: '#ef5350',
    fontWeight: '600',
  },
  treeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#a5d6a7',
    textAlign: 'center',
  },
  messagePreview: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  messagePreviewText: {
    color: '#fff',
    fontSize: 14,
  },
  voiceButtonContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
});