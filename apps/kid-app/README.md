# Learna Kid App

A voice-first chat experience for children. Learna is a friendly tree character that children can talk to — like a friend, not a tutor.

## Features

- 🎙️ Voice-first experience — tap and talk to Learna
- 🌳 Animated tree character — Learna responds with voice and expression
- 👶 Age-appropriate — content adapts to child's age group
- 🔒 Safe — no web access, filtered content, safety monitoring
- 📈 Grows with them — Learna evolves as the child ages

## Prerequisites

- Node.js 18+
- Expo Go (iOS/Android) for testing
- Supabase project (see backend/README.md)

## Installation

```bash
cd apps/kid-app
npm install
```

## Environment Setup

Create a `.env` file:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## Running

```bash
npx expo start
```

Scan the QR code with Expo Go on your device, or run on a simulator:

```bash
npx expo run:ios
# or
npx expo run:android
```

## App Flow

1. **Welcome Screen** — Child sees Learna the tree, taps to start
2. **Setup** — If no profile, prompts for name and age group
3. **Main Chat** — Voice conversation with Learna
4. **Learna Always Visible** — Tree character on screen throughout

## Voice Pipeline

1. User holds push-to-talk button → Speech recorded
2. Speech sent to Expo Speech API → Text
3. Text sent to Edge Function → AI response + safety check
4. AI response → ElevenLabs TTS → Audio played to child

## Age Groups

| Group | Age Range | Description |
|-------|-----------|-------------|
| toddler | 4-5 | Simple vocabulary, short responses, very safe content |
| young | 6-8 | Growing vocabulary, moderate length, safe + gentle topics |
| older | 9-12 | More complex, longer conversations, flags concerning topics to parents |

## Project Structure

```
kid-app/
├── App.tsx              # Main app entry
├── src/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── SetupScreen.tsx
│   │   └── ChatScreen.tsx
│   ├── components/
│   │   ├── LearnaTree.tsx      # Animated tree character
│   │   ├── VoiceButton.tsx     # Push-to-talk button
│   │   └── AgePicker.tsx       # Age group selection
│   ├── services/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── speech.ts           # STT/TTS services
│   │   └── chat.ts             # Chat API calls
│   ├── hooks/
│   │   ├── useVoiceChat.ts     # Main voice chat logic
│   │   └── useChild.ts         # Child profile state
│   ├── constants/
│   │   └── ageGroups.ts        # Age-based settings
│   └── types/
│       └── index.ts            # TypeScript types
├── app.json
└── package.json
```