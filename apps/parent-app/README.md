# Learna Parent App

Parent dashboard for managing your child's Learna experience, safety settings, and monitoring.

## Features

- 👶 **Child Management** — Add/manage child profiles
- 🛡️ **Safety Controls** — Set content filters, age groups, notification preferences
- 📊 **Activity Monitoring** — View conversation history, safety events
- 🔔 **Notifications** — Receive alerts about concerning content
- 📸 **Milestones** — Store special photos (not analyzed by AI)

## Prerequisites

- Node.js 18+
- Expo Go (iOS/Android) for testing
- Supabase project (see backend/README.md)

## Installation

```bash
cd apps/parent-app
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

## App Flow

1. **Login/Signup** — Parent authenticates
2. **Dashboard** — Overview of children and recent activity
3. **Child Detail** — Manage individual child profiles
4. **Safety Settings** — Configure content filters
5. **Activity Log** — View conversations and events

## Project Structure

```
parent-app/
├── App.tsx
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── ChildDetailScreen.tsx
│   │   ├── SafetySettingsScreen.tsx
│   │   └── ActivityLogScreen.tsx
│   ├── components/
│   │   ├── ChildCard.tsx
│   │   ├── SafetyEventCard.tsx
│   │   └── ConversationItem.tsx
│   └── services/
│       └── supabase.ts
└── package.json
```
