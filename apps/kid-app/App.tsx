import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { useChild } from './src/hooks/useChild';
import { supabase } from './src/services/supabase';
import { Child, AgeGroup } from './src/types';

type Screen = 'welcome' | 'setup' | 'chat';

export default function App() {
  const { child, isLoading, setChildId } = useChild();
  const [screen, setScreen] = useState<Screen>('welcome');

  // For demo purposes, create a local child profile
  // In production, this would come from the parent app or onboarding
  const createChildProfile = async (name: string, ageGroup: AgeGroup) => {
    try {
      // Get the current user (in production, this would be authenticated)
      // For demo, we'll use a placeholder or get the authenticated user
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data, error } = await supabase
          .from('children')
          .insert({
            parent_id: user.id,
            name,
            age_group: ageGroup,
            avatar_seed: Math.random().toString(36).substring(7),
          })
          .select()
          .single();

        if (error) throw error;
        
        await setChildId(data.id);
        setScreen('chat');
      } else {
        // For demo without auth - create a "demo" child locally
        // In production, this flow wouldn't exist
        const demoChild: Child = {
          id: 'demo-' + Date.now(),
          parent_id: 'demo',
          name,
          age_group: ageGroup,
          avatar_seed: Math.random().toString(36).substring(7),
          created_at: new Date().toISOString(),
        };
        
        // Store demo child in memory (not persisted)
        await setChildId(demoChild.id);
        setScreen('chat');
      }
    } catch (error) {
      console.error('Error creating child profile:', error);
      // Fallback for demo
      setScreen('chat');
    }
  };

  // Show loading while checking for child profile
  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#66bb6a" />
      </View>
    );
  }

  // If we have a child profile, go directly to chat
  if (child && screen === 'welcome') {
    setScreen('chat');
  }

  switch (screen) {
    case 'welcome':
      return <WelcomeScreen onStart={() => setScreen('setup')} />;
    
    case 'setup':
      return <SetupScreen onComplete={createChildProfile} />;
    
    case 'chat':
      if (!child) {
        return <WelcomeScreen onStart={() => setScreen('setup')} />;
      }
      return <ChatScreen child={child} />;
    
    default:
      return <WelcomeScreen onStart={() => setScreen('setup')} />;
  }
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a472a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});