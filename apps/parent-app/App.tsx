import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getCurrentUser, signIn, signUp, getChildren, createChild, signOut } from './src/services/supabase';
import { Child } from './src/services/types';

type Screen = 'auth' | 'dashboard' | 'addChild';

export default function App() {
  const [screen, setScreen] = useState<Screen>('auth');
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // Check for existing session
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserId(user.id);
        const childrenData = await getChildren(user.id);
        setChildren(childrenData || []);
        setScreen('dashboard');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert('Success', 'Check your email to verify your account');
      } else {
        const { user } = await signIn(email, password);
        if (user) {
          setUserId(user.id);
          const childrenData = await getChildren(user.id);
          setChildren(childrenData || []);
          setScreen('dashboard');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChild = async (name: string, ageGroup: string) => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const newChild = await createChild(userId, name, ageGroup as any);
      setChildren([newChild, ...children]);
      setScreen('dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add child');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserId(null);
      setChildren([]);
      setScreen('auth');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading && screen === 'auth') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#66bb6a" />
      </View>
    );
  }

  if (screen === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>Learna Parent</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create your account' : 'Sign in to manage your children'}
          </Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleAuth}>
            <Text style={styles.buttonText}>
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsSignUp(!isSignUp)}
          >
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === 'addChild') {
    return (
      <AddChildScreen
        onAdd={handleAddChild}
        onCancel={() => setScreen('dashboard')}
        isLoading={isLoading}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Children</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {children.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No children yet</Text>
          <Text style={styles.emptyText}>
            Add your first child to get started with Learna
          </Text>
        </View>
      ) : (
        <FlatList
          data={children}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>
                  {item.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{item.name}</Text>
                <Text style={styles.childAge}>
                  Age group: {item.age_group}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setScreen('addChild')}
      >
        <Text style={styles.addButtonText}>+ Add Child</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Simple Add Child Screen Component
function AddChildScreen({
  onAdd,
  onCancel,
  isLoading,
}: {
  onAdd: (name: string, ageGroup: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('young');

  const handleSubmit = () => {
    if (name.trim()) {
      onAdd(name.trim(), ageGroup);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Child</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Child's Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Age Group</Text>
        <View style={styles.ageOptions}>
          {['toddler', 'young', 'older'].map((age) => (
            <TouchableOpacity
              key={age}
              style={[
                styles.ageOption,
                ageGroup === age && styles.ageOptionSelected,
              ]}
              onPress={() => setAgeGroup(age)}
            >
              <Text
                style={[
                  styles.ageOptionText,
                  ageGroup === age && styles.ageOptionTextSelected,
                ]}
              >
                {age.charAt(0).toUpperCase() + age.slice(1)} ({age === 'toddler' ? '4-5' : age === 'young' ? '6-8' : '9-12'})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, !name.trim() && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!name.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Add Child</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#66bb6a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#66bb6a',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  signOutText: {
    color: '#ef5350',
    fontSize: 14,
  },
  cancelText: {
    color: '#66bb6a',
    fontSize: 14,
  },
  list: {
    padding: 20,
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#66bb6a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  childAvatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  childAge: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#66bb6a',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  ageOptions: {
    gap: 8,
  },
  ageOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageOptionSelected: {
    borderColor: '#66bb6a',
    backgroundColor: '#e8f5e9',
  },
  ageOptionText: {
    fontSize: 16,
    color: '#333',
  },
  ageOptionTextSelected: {
    color: '#2d5a27',
    fontWeight: '600',
  },
});