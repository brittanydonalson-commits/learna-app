# Learna Backend - Supabase

## Overview

Supabase provides the backend infrastructure for Learna:
- **Database** — User profiles, child accounts, conversations, safety events
- **Authentication** — Parent accounts + child profiles under each parent
- **Storage** — Photo uploads (milestones only, no AI analysis)
- **Edge Functions** — AI chat processing, safety evaluation, notifications

## Schema

### Tables

#### `profiles` (extends auth.users)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | FK to auth.users |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### `children`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| parent_id | uuid | FK to profiles.id |
| name | text | Child's display name |
| age_group | text | 'toddler' (4-5), 'young' (6-8), 'older' (9-12) |
| avatar_seed | text | For generating consistent avatar |
| created_at | timestamptz | |

#### `conversations`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| child_id | uuid | FK to children.id |
| started_at | timestamptz | |
| ended_at | timestamptz | Nullable |

#### `messages`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| conversation_id | uuid | FK to conversations.id |
| role | text | 'child' or 'learna' |
| content | text | Message text |
| created_at | timestamptz | |

#### `safety_events`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| child_id | uuid | FK to children.id |
| conversation_id | uuid | FK to conversations.id |
| severity | text | 'low', 'medium', 'high', 'critical' |
| category | text | Category of concern |
| details | jsonb | Additional context |
| notified_parent | boolean | Parent notified? |
| resolved | boolean | Addressed? |
| created_at | timestamptz | |

#### `parent_notifications`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| parent_id | uuid | FK to profiles.id |
| type | text | 'safety_alert', 'conversation_summary', etc |
| title | text | Notification title |
| body | text | Notification body |
| data | jsonb | Additional payload |
| read | boolean | |
| created_at | timestamptz | |

#### `milestone_photos`
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | PK |
| child_id | uuid | FK to children.id |
| storage_path | text | Supabase Storage path |
| caption | text | Parent-provided caption |
| created_at | timestamptz | |

## Setup

1. Create a Supabase project
2. Run the migrations in `migrations/001_initial.sql`
3. Configure RLS policies (see `migrations/002_rls_policies.sql`)
4. Set up environment variables in your apps

## Environment Variables

```env
# Kid App / Parent App
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key

# For AI features (Edge Functions)
OPENROUTER_API_KEY=your-key
ELEVENLABS_API_KEY=your-key
```

## Security

- Row Level Security (RLS) ensures parents can only see their own children's data
- Children have no direct database access (all through Edge Functions)
- Photos are stored but never analyzed by AI
- All AI conversations go through safety evaluation