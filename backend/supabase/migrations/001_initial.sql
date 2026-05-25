-- Learna Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Children table
CREATE TABLE public.children (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    age_group text NOT NULL CHECK (age_group IN ('toddler', 'young', 'older')),
    avatar_seed text,
    created_at timestamptz DEFAULT now()
);

-- Conversations table
CREATE TABLE public.conversations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    started_at timestamptz DEFAULT now(),
    ended_at timestamptz
);

-- Messages table
CREATE TABLE public.messages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('child', 'learna')),
    content text NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Safety events table
CREATE TABLE public.safety_events (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL,
    severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category text NOT NULL,
    details jsonb DEFAULT '{}',
    notified_parent boolean DEFAULT false,
    resolved boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Parent notifications table
CREATE TABLE public.parent_notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text NOT NULL,
    body text,
    data jsonb DEFAULT '{}',
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Milestone photos table
CREATE TABLE public.milestone_photos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
    storage_path text NOT NULL,
    caption text,
    created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_children_parent ON public.children(parent_id);
CREATE INDEX idx_conversations_child ON public.conversations(child_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_safety_events_child ON public.safety_events(child_id);
CREATE INDEX idx_notifications_parent ON public.parent_notifications(parent_id);
CREATE INDEX idx_photos_child ON public.milestone_photos(child_id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, created_at, updated_at)
    VALUES (new.id, now(), now());
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();