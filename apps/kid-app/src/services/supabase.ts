import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

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