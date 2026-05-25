-- Row Level Security Policies
-- Run this after 001_initial.sql

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_photos ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Children: Parents can only see their own children
CREATE POLICY "Parents can view own children"
    ON public.children FOR SELECT
    USING (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Parents can insert own children"
    ON public.children FOR INSERT
    WITH CHECK (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Parents can update own children"
    ON public.children FOR UPDATE
    USING (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Parents can delete own children"
    ON public.children FOR DELETE
    USING (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Conversations: Parents can see conversations for their children
CREATE POLICY "Parents can view own children conversations"
    ON public.conversations FOR SELECT
    USING (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "System can insert conversations"
    ON public.conversations FOR INSERT
    WITH CHECK (true);

-- Messages: Parents can see messages from their children's conversations
CREATE POLICY "Parents can view own children messages"
    ON public.messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT c.id FROM public.conversations c
            JOIN public.children ch ON c.child_id = ch.id
            WHERE ch.parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- Safety events: Parents can see safety events for their children
CREATE POLICY "Parents can view own children safety events"
    ON public.safety_events FOR SELECT
    USING (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Parents can update own children safety events"
    ON public.safety_events FOR UPDATE
    USING (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

-- Parent notifications: Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON public.parent_notifications FOR SELECT
    USING (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own notifications"
    ON public.parent_notifications FOR UPDATE
    USING (parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid()));

-- Milestone photos: Parents can see their children's photos
CREATE POLICY "Parents can view own children photos"
    ON public.milestone_photos FOR SELECT
    USING (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Parents can insert own children photos"
    ON public.milestone_photos FOR INSERT
    WITH CHECK (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY "Parents can delete own children photos"
    ON public.milestone_photos FOR DELETE
    USING (
        child_id IN (
            SELECT id FROM public.children 
            WHERE parent_id = (SELECT id FROM public.profiles WHERE id = auth.uid())
        )
    );