# Learna

An AI chat buddy for kids — a friend, not a tutor.

## Vision

Learna is an AI companion that grows with your child. Unlike tutoring apps that focus on education, Learna focuses on friendship, emotional support, and creative play. Designed for children ages 4-12, Learna provides a safe, age-appropriate conversational experience that evolves as the child grows.

## Apps

- **Kid App** — The child's experience with Learna (voice-first, tree character)
- **Parent App** — Management, controls, safety settings, and monitoring

## Tech Stack

- **Mobile:** React Native (Expo)
- **Backend:** Supabase
- **AI:** OpenRouter (LLM) + ElevenLabs (Voice)
- **Authentication:** Supabase Auth

## Getting Started

See each app's README for setup instructions:

- [Kid App](./apps/kid-app/README.md)
- [Parent App](./apps/parent-app/README.md)
- [Backend](./backend/supabase/README.md)

## Architecture

```
learna-app/
├── apps/
│   ├── kid-app/      # Child-facing mobile app
│   └── parent-app/   # Parent management app
└── backend/
    └── supabase/     # Database, auth, Edge Functions
```

## Safety First

Learna is built with child safety at the core:

- No direct web access for children
- Age-appropriate content ratings (G, PG, PG-13)
- Behavioral monitoring with parent notifications
- Red flag escalation system
- No AI analysis of uploaded photos (storage only)