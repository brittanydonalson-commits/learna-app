// TypeScript types for Learna

export type AgeGroup = 'toddler' | 'young' | 'older';

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  age_group: AgeGroup;
  avatar_seed: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  child_id: string;
  started_at: string;
  ended_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'child' | 'learna';
  content: string;
  created_at: string;
}

export interface SafetyEvent {
  id: string;
  child_id: string;
  conversation_id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  details: Record<string, unknown>;
  notified_parent: boolean;
  resolved: boolean;
  created_at: string;
}

export interface ParentNotification {
  id: string;
  parent_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

export interface ChatRequest {
  child_id: string;
  message: string;
  age_group: AgeGroup;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  safety_triggered: boolean;
  safety_severity?: 'low' | 'medium' | 'high' | 'critical';
  safety_category?: string;
}