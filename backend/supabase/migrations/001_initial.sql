-- Learna Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    full_name TEXT,
    avatar_url TEXT
);

-- CHILDREN (child accounts under parent)
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    age_group TEXT NOT NULL CHECK (age_group IN ('toddler', 'young', 'older')),
    avatar_seed TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- MESSAGES
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('child', 'learna')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAFETY EVENTS
CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    notified_parent BOOLEAN DEFAULT FALSE,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PARENT NOTIFICATIONS
CREATE TABLE parent_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MILESTONE PHOTOS (storage only - NO AI analysis)
CREATE TABLE milestone_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id UUID NOT NULL REFERENCES children(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_children_parent ON children(parent_id);
CREATE INDEX idx_conversations_child ON conversations(child_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_safety_events_child ON safety_events(child_id);
CREATE INDEX idx_parent_notifications_parent ON parent_notifications(parent_id);

-- RLS POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestone_photos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Children: Parents can only see their own children
CREATE POLICY "Parents can view own children" ON children
    FOR SELECT USING (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Parents can insert own children" ON children
    FOR INSERT WITH CHECK (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Parents can update own children" ON children
    FOR UPDATE USING (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Parents can delete own children" ON children
    FOR DELETE USING (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Conversations: Parents can see their children's conversations
CREATE POLICY "Parents can view conversations" ON conversations
    FOR SELECT USING (
        child_id IN (SELECT id FROM children WHERE parent_id = (SELECT id FROM profiles WHERE auth.uid() = id))
    );

-- Messages: Same as conversations
CREATE POLICY "Parents can view messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations WHERE child_id IN (
                SELECT id FROM children WHERE parent_id = (SELECT id FROM profiles WHERE auth.uid() = id)
            )
        )
    );

-- Safety Events: Parents can see their children's safety events
CREATE POLICY "Parents can view safety events" ON safety_events
    FOR SELECT USING (
        child_id IN (SELECT id FROM children WHERE parent_id = (SELECT id FROM profiles WHERE auth.uid() = id))
    );

CREATE POLICY "Service role can insert safety events" ON safety_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update safety events" ON safety_events
    FOR UPDATE USING (true);

-- Parent Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON parent_notifications
    FOR SELECT USING (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

CREATE POLICY "Users can update own notifications" ON parent_notifications
    FOR UPDATE USING (parent_id = (SELECT id FROM profiles WHERE auth.uid() = id));

-- Milestone Photos: Parents can manage their children's photos
CREATE POLICY "Parents can view photos" ON milestone_photos
    FOR SELECT USING (
        child_id IN (SELECT id FROM children WHERE parent_id = (SELECT id FROM profiles WHERE auth.uid() = id))
    );

CREATE POLICY "Parents can insert photos" ON milestone_photos
    FOR INSERT WITH CHECK (
        child_id IN (SELECT id FROM children WHERE parent_id = (SELECT id FROM profiles WHERE auth.uid() = id))
    );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();