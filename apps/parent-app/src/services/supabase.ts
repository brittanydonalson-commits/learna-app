import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth functions
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Profile functions
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
};

// Children functions
export const getChildren = async (parentId: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createChild = async (
  parentId: string,
  name: string,
  ageGroup: string
) => {
  const { data, error } = await supabase
    .from('children')
    .insert({
      parent_id: parentId,
      name,
      age_group: ageGroup,
      avatar_seed: Math.random().toString(36).substring(7),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateChild = async (childId: string, updates: Record<string, unknown>) => {
  const { data, error } = await supabase
    .from('children')
    .update(updates)
    .eq('id', childId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteChild = async (childId: string) => {
  const { error } = await supabase
    .from('children')
    .delete()
    .eq('id', childId);
  if (error) throw error;
};

// Notifications functions
export const getNotifications = async (parentId: string) => {
  const { data, error } = await supabase
    .from('parent_notifications')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
};

export const markNotificationRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('parent_notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) throw error;
};

export const markAllNotificationsRead = async (parentId: string) => {
  const { error } = await supabase
    .from('parent_notifications')
    .update({ read: true })
    .eq('parent_id', parentId)
    .eq('read', false);
  if (error) throw error;
};

// Safety events functions
export const getSafetyEvents = async (childId: string) => {
  const { data, error } = await supabase
    .from('safety_events')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const resolveSafetyEvent = async (eventId: string) => {
  const { error } = await supabase
    .from('safety_events')
    .update({ resolved: true })
    .eq('id', eventId);
  if (error) throw error;
};

// Conversations functions
export const getConversations = async (childId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('child_id', childId)
    .order('started_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const getMessages = async (conversationId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};