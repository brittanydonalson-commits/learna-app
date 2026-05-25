import { useState, useEffect, useCallback } from 'react';
import { Child, AgeGroup } from '../types';
import { getChildProfile } from '../services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHILD_ID_KEY = 'learna_child_id';

interface UseChildResult {
  child: Child | null;
  isLoading: boolean;
  error: Error | null;
  setChildId: (id: string) => Promise<void>;
  clearChild: () => Promise<void>;
  hasChild: boolean;
}

export const useChild = (): UseChildResult => {
  const [child, setChild] = useState<Child | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load child ID from storage on mount
  useEffect(() => {
    const loadChild = async () => {
      try {
        const childId = await AsyncStorage.getItem(CHILD_ID_KEY);
        if (childId) {
          const childData = await getChildProfile(childId);
          setChild(childData);
        }
      } catch (err) {
        console.error('Error loading child:', err);
        // Don't set error - just means no child profile yet
      } finally {
        setIsLoading(false);
      }
    };

    loadChild();
  }, []);

  const setChildId = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await AsyncStorage.setItem(CHILD_ID_KEY, id);
      const childData = await getChildProfile(id);
      setChild(childData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearChild = useCallback(async () => {
    await AsyncStorage.removeItem(CHILD_ID_KEY);
    setChild(null);
  }, []);

  return {
    child,
    isLoading,
    error,
    setChildId,
    clearChild,
    hasChild: !!child,
  };
};