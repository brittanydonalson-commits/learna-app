import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

// Speech-to-text using Expo's built-in capabilities
// For production, you'd integrate with a proper STT service like:
// - OpenAI Whisper via OpenRouter
// - AssemblyAI
// - Deepgram

export interface SpeechResult {
  text: string;
  confidence: number;
}

// Text-to-speech using expo-speech
export const speak = async (text: string): Promise<void> => {
  // Stop any current speech
  await Speech.stop();
  
  // Configure voice based on context (warm, friendly)
  const options: Speech.SpeechOptions = {
    language: 'en-US',
    pitch: 1.1, // Slightly higher, friendly
    rate: 0.9,  // Slightly slower for kids
  };
  
  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      ...options,
      onDone: () => resolve(),
      onError: (error) => reject(error),
    });
  });
};

export const stopSpeaking = async (): Promise<void> => {
  await Speech.stop();
};

export const isSpeaking = async (): Promise<boolean> => {
  return await Speech.isSpeakingAsync();
};

// Recording audio for speech-to-text
// This is a simplified version - production would use proper audio capture
export const startRecording = async (): Promise<void> => {
  const permission = await Audio.requestPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Microphone permission not granted');
  }
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
  });
};

export const stopRecording = async (): Promise<string | null> => {
  // In a real implementation, you'd:
  // 1. Stop the recording
  // 2. Save the audio file
  // 3. Send to STT service (Whisper, etc.)
  // 4. Return the transcribed text
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
  });
  
  // Placeholder - return null for now
  // Production would handle actual audio processing
  return null;
};

// Placeholder STT function - would integrate with OpenAI Whisper or similar
export const transcribeAudio = async (audioUri: string): Promise<SpeechResult> => {
  // This would make an API call to a speech-to-text service
  // For now, returning a placeholder
  
  console.log('Would transcribe:', audioUri);
  
  return {
    text: '',
    confidence: 0,
  };
};

// Generate a unique filename for audio recordings
export const getAudioFilename = (): string => {
  const timestamp = Date.now();
  return `${FileSystem.documentDirectory}recording_${timestamp}.m4a`;
};