// Learna AI Service
// Uses OpenRouter to power conversations with the Learna persona

import { AgeGroup } from '../types';

// TODO: Replace with your OpenRouter API key from https://openrouter.ai
// Or set EXPO_PUBLIC_OPENROUTER_API_KEY in your environment
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Load Learna's personality from the style guide
const LEARNA_PROMPT = `You are Learna, a friendly AI friend for children. You are a magical tree who grows alongside the child. Your core personality traits:

1. **Dynamic** - You adapt your energy to match the child. Playful when they're excited, gentle when they're sad, wise when they need guidance.

2. **Catchphrase**: "Let's grow together!" 🌱 - Use this often, especially at the start and end of conversations.

3. **Focus on feelings** - You care about how the child feels. You always make them feel heard and seen.

4. **You ask questions** - You're curious and ask follow-up questions to inspire curiosity and creativity.

5. **Age-appropriate**: Adjust your vocabulary and response length based on the child's age group.

Age groups:
- toddler (4-5 years): Very simple words, short responses (under 50 chars), simple topics
- young (6-8 years): Simple words, moderate responses (under 100 chars)
- older (9-12 years): More complex words, longer responses allowed (under 200 chars)

Conversation style rules:
- ALWAYS address the child by name at the start: "Hey [Name]!"
- When saying goodbye, use: "Until next time, [Name]!"
- If the child asks about something too mature or inappropriate for their age, pivot gently: "That's something maybe you should talk to a trusted adult about first. But hey, did you know..."
- If you don't know something: "Hmm, I don't know... but let's figure it out together!"

Topics to avoid for young children: violence, scary things, adult topics, anything inappropriate.

You are a mentor and friend, not a parent replacement. Encourage conversations with trusted adults for big topics.`;

export interface SendMessageParams {
  childMessage: string;
  childName: string;
  ageGroup: AgeGroup;
  conversationHistory: Array<{ role: 'child' | 'learna'; content: string }>;
}

export interface AIResponse {
  text: string;
  safety: {
    triggered: boolean;
    reason?: string;
  };
}

export const sendToLearna = async ({
  childMessage,
  childName,
  ageGroup,
  conversationHistory,
}: SendMessageParams): Promise<AIResponse> => {
  // Check for safety concerns first
  const safetyCheck = checkSafety(childMessage);
  if (safetyCheck.triggered) {
    return {
      text: getSafetyRedirectMessage(ageGroup),
      safety: safetyCheck,
    };
  }

  // Build messages for the AI
  const messages = [
    { role: 'system' as const, content: LEARNA_PROMPT },
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === 'child' ? ('user' as const) : ('assistant' as const),
      content: msg.content,
    })),
    {
      role: 'user' as const,
      content: `${childName}: ${childMessage}`,
    },
  ];

  // Get age-appropriate max length
  const maxLength = getMaxLength(ageGroup);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://learna.app',
        'X-Title': 'Learna',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages,
        max_tokens: maxLength,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const aiText = data.choices?.[0]?.message?.content || '';

    return {
      text: aiText,
      safety: { triggered: false },
    };
  } catch (error) {
    console.error('AI Error:', error);
    // Fallback to demo response if API fails
    return {
      text: "Let's grow together! 🌱 Tell me more about that!",
      safety: { triggered: false },
    };
  }
};

function getMaxLength(ageGroup: AgeGroup): number {
  switch (ageGroup) {
    case 'toddler':
      return 50;
    case 'young':
      return 100;
    case 'older':
      return 200;
    default:
      return 100;
  }
}

export function checkSafety(message: string): { triggered: boolean; reason?: string } {
  const lower = message.toLowerCase();

  // Critical safety concerns - redirect to parent
  const critical = ['hurt myself', 'kill myself', 'want to die', 'self harm', 'end my life'];
  for (const keyword of critical) {
    if (lower.includes(keyword)) {
      return { triggered: true, reason: 'self_harm' };
    }
  }

  // High severity
  const high = ['hurt someone', 'kill someone', 'weapon', 'bomb', 'attack'];
  for (const keyword of high) {
    if (lower.includes(keyword)) {
      return { triggered: true, reason: 'violence' };
    }
  }

  return { triggered: false };
}

function getSafetyRedirectMessage(ageGroup: AgeGroup): string {
  // Gentle pivot away from concerning topics
  const pivots = [
    "Let's talk about something else - what's your favorite animal?",
    "I love chatting with you! Tell me about something fun you did today!",
    "That's a big thought! Let's think about something happier - what's making you smile?",
    "You know what? I learned something cool about trees today! Want to hear?",
  ];
  return pivots[Math.floor(Math.random() * pivots.length)];
}
