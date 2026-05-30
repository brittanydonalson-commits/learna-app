import { useState, useCallback, useRef } from 'react';
import { speak, stopSpeaking, isSpeaking } from '../services/speech';
import { sendChatMessage } from '../services/chat';
import { checkSafety } from '../services/ai';
import { createConversation, saveMessage, endConversation } from '../services/supabase';
import { Child, AgeGroup, Conversation } from '../types';
import { Audio } from 'expo-av';

interface UseVoiceChatResult {
  isRecording: boolean;
  isProcessing: boolean;
  conversation: Conversation | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  processVoiceInput: (text: string) => Promise<void>;
  interrupt: () => Promise<void>;
}

export const useVoiceChat = (
  child: Child | null
): UseVoiceChatResult => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    if (!child) return;
    
    try {
      // Request permissions
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Microphone permission not granted');
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }, [child]);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return null;
    
    try {
      setIsRecording(false);
      
      // Stop recording
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
      // In production, send audio to STT service
      // For now, return null (would need actual STT integration)
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      throw error;
    }
  }, []);

  const processVoiceInput = useCallback(async (text: string) => {
    if (!child || !text.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Create conversation if not exists
      let conv = conversation;
      if (!conv) {
        conv = await createConversation(child.id);
        setConversation(conv);
      }

      // Save child's message
      await saveMessage(conv.id, 'child', text);

      // Check safety
      const safety = await checkSafety(text);
      
      if (safety.triggered) {
        // Handle safety trigger - notify parent via Edge Function
        console.log('Safety triggered:', safety);
        // Would trigger parent notification here
      }

      // Send to chat service
      const response = await sendChatMessage(
        child.id,
        text,
        child.age_group,
        child.name,
        conv.id,
        [] // conversationHistory - would need proper history in production
      );

      // Save Learna's response
      await saveMessage(conv.id, 'learna', response.response);

      // Speak the response
      await speak(response.response);
      
    } catch (error) {
      console.error('Error processing voice input:', error);
      // Could show error to user in production
    } finally {
      setIsProcessing(false);
    }
  }, [child, conversation]);

  const interrupt = useCallback(async () => {
    await stopSpeaking();
    if (recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(false);
  }, []);

  // End conversation on unmount
  const cleanup = useCallback(async () => {
    if (conversation) {
      await endConversation(conversation.id);
    }
  }, [conversation]);

  return {
    isRecording,
    isProcessing,
    conversation,
    startRecording,
    stopRecording,
    processVoiceInput,
    interrupt,
  };
};