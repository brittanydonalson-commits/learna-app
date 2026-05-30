import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// For web, we need to load env vars differently
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL 
  || 'https://oendxvxdevqhpoagqohs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbmR4dnhkZXZxaHBvYWdxb2hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3MDI4MzcsImV4cCI6MjA5NDI3ODgzN30.pLR5D2kwh0A3bzPtcqNX7wJDT0zTzXWvt1bdZHbWnu8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For kid app, we don't use auth directly
// The child ID is passed from the parent app or stored locally
// In production, this would be more secure with proper token passing

export const getChildProfile = async (childId: string) => {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getConversations = async (childId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('child_id', childId)
    .order('started_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createConversation = async (childId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ child_id: childId })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const endConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('conversations')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', conversationId);
  
  if (error) throw error;
};

export const saveMessage = async (
  conversationId: string,
  role: 'child' | 'learna',
  content: string
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
    .select()
    .single();
  
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