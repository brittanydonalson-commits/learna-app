import { supabase } from './supabase';
import { sendToLearna, AIResponse } from './ai';
import { AgeGroup } from '../types';

export interface ChatRequest {
  childId: string;
  message: string;
  ageGroup: AgeGroup;
  childName: string;
  conversationHistory: Array<{ role: 'child' | 'learna'; content: string }>;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  safety_triggered: boolean;
  safety_reason?: string;
}

export const sendChatMessage = async (
  childId: string,
  message: string,
  ageGroup: AgeGroup,
  childName: string,
  conversationId: string,
  conversationHistory: Array<{ role: 'child' | 'learna'; content: string }>
): Promise<ChatResponse> => {
  // Send to Learna AI
  const aiResult: AIResponse = await sendToLearna({
    childMessage: message,
    childName: childName,
    ageGroup,
    conversationHistory,
  });

  // Save the messages to the database
  try {
    await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        role: 'child',
        content: message,
      },
      {
        conversation_id: conversationId,
        role: 'learna',
        content: aiResult.text,
      },
    ]);
  } catch (err) {
    // Database might not be connected yet - that's okay for MVP
    console.log('Message save skipped:', err);
  }

  return {
    response: aiResult.text,
    conversationId,
    safety_triggered: aiResult.safety.triggered,
    safety_reason: aiResult.safety.reason,
  };
};