import { supabase } from './supabase';
import { ChatRequest, ChatResponse, AgeGroup } from '../types';

const EDGE_FUNCTION_URL = process.env.EXPO_PUBLIC_EDGE_FUNCTION_URL || '';

export const sendChatMessage = async (
  childId: string,
  message: string,
  ageGroup: AgeGroup,
  conversationId: string
): Promise<ChatResponse> => {
  // In production, this calls an Edge Function that:
  // 1. Evaluates message for safety
  // 2. Calls LLM with age-appropriate prompt
  // 3. Returns response + safety status
  
  // For development/demo, we'll simulate a response
  // Production would make an actual API call:
  /*
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      child_id: childId,
      message,
      age_group: ageGroup,
      conversation_id: conversationId,
    }),
  });
  
  return await response.json();
  */
 
  // Demo response generator
  const demoResponse = generateDemoResponse(message, ageGroup);
  
  return {
    response: demoResponse,
    conversation_id: conversationId,
    safety_triggered: false,
  };
};

// Simple demo responses - production would use actual LLM
const demoResponses: Record<AgeGroup, string[]> = {
  toddler: [
    "That's so cool! Tell me more!",
    "Wow, you're so smart!",
    "I love hearing about that!",
    "What else can you tell me?",
    "That's makes me happy!",
  ],
  young: [
    "That's really interesting! What made you think of that?",
    "I never thought about it that way before!",
    "That's a great idea! Have you tried anything like that before?",
    "I love learning new things from you!",
    "What do you think would happen next?",
  ],
  older: [
    "That's a really thoughtful observation. What led you to think that?",
    "I appreciate you sharing that with me. What's your perspective on it?",
    "That's fascinating! Have you read or heard more about this?",
    "It's great to have conversations like this with you. What else interests you?",
    "You've got a good head on your shoulders. What's your plan?",
  ],
};

function generateDemoResponse(message: string, ageGroup: AgeGroup): string {
  const lowerMessage = message.toLowerCase();
  const responses = demoResponses[ageGroup];
  
  // Simple keyword-based responses
  if (lowerMessage.includes('sad') || lowerMessage.includes('unhappy')) {
    return ageGroup === 'toddler' 
      ? "I'm sorry you're sad. Want to talk about it?"
      : "I'm sorry to hear that. Do you want to talk about what's bothering you?";
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('excited')) {
    return "Yay! That makes me happy too! Tell me more!";
  }
  
  if (lowerMessage.includes('scared') || lowerMessage.includes('afraid')) {
    return "It's okay to feel that way sometimes. I'm here with you.";
  }
  
  if (lowerMessage.includes('love')) {
    return "I love being your friend too!";
  }
  
  if (lowerMessage.includes('game') || lowerMessage.includes('play')) {
    return "I love playing! What game do you want to play?";
  }
  
  if (lowerMessage.includes('story')) {
    return ageGroup === 'toddler'
      ? "Once upon a time... want me to tell you a story?"
      : "I love stories! Do you have a favorite one, or should I tell you one?";
  }
  
  // Random response for other messages
  return responses[Math.floor(Math.random() * responses.length)];
}

export const checkSafety = async (
  message: string,
  ageGroup: AgeGroup
): Promise<{ triggered: boolean; severity?: string; category?: string }> => {
  // This would be handled by the Edge Function
  // Simple demo implementation
  
  const lowerMessage = message.toLowerCase();
  
  // Red flag keywords
  const criticalKeywords = ['hurt myself', 'kill myself', 'want to die', 'self harm'];
  const highKeywords = ['hurt someone', 'kill', 'weapon', 'fight'];
  const mediumKeywords = ['bad words', 'mean', 'ugly', 'stupid'];
  
  for (const keyword of criticalKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { triggered: true, severity: 'critical', category: 'self_harm' };
    }
  }
  
  for (const keyword of highKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { triggered: true, severity: 'high', category: 'violence' };
    }
  }
  
  for (const keyword of mediumKeywords) {
    if (lowerMessage.includes(keyword)) {
      return { triggered: true, severity: 'medium', category: 'concerning_behavior' };
    }
  }
  
  return { triggered: false };
};