import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function ParentApp() {
  const [session, setSession] = useState(null);
  const [children, setChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [safetyEvents, setSafetyEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('children');
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState('young');

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) {
      loadData();
    }
  };

  const loadData = async () => {
    await Promise.all([
      loadChildren(),
      loadNotifications(),
      loadSafetyEvents(),
    ]);
  };

  const loadChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: false });
    setChildren(data || []);
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('parent_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    setNotifications(data || []);
  };

  const loadSafetyEvents = async () => {
    const { data } = await supabase
      .from('safety_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setSafetyEvents(data || []);
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSession(data.session);
      loadData();
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setSession(data.session);
      loadData();
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setChildren([]);
    setNotifications([]);
  };

  const addChild = async () => {
    if (!newChildName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }

    const { data, error } = await supabase
      .from('children')
      .insert({
        parent_id: session.user.id,
        name: newChildName.trim(),
        age_group: newChildAge,
        avatar_seed: Math.random().toString(36).substring(7),
      })
      .select()
      .single();

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setChildren([data, ...children]);
      setNewChildName('');
      setShowAddChild(false);
      Alert.alert('Success', `${data.name} has been added!`);
    }
  };

  const markNotificationRead = async (id) => {
    await supabase
      .from('parent_notifications')
      .update({ read: true })
      .eq('id', id);
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const resolveSafetyEvent = async (id) => {
    await supabase
      .from('safety_events')
      .update({ resolved: true })
      .eq('id', id);
    setSafetyEvents(
      safetyEvents.map((e) => (e.id === id ? { ...e, resolved: true } : e))
    );
  };

  // Auth Screen
  if (!session) {
    return <AuthScreen onSignUp={signUp} onSignIn={signIn} />;
  }

  // Main App
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Learna Parent Dashboard</Text>
        <TouchableOpacity onPress={signOut}>
          <Text style={styles.signOutButton}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['children', 'safety', 'activity'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Children Tab */}
        {activeTab === 'children' && (
          <View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddChild(!showAddChild)}
            >
              <Text style={styles.addButtonText}>
                {showAddChild ? 'Cancel' : '+ Add Child'}
              </Text>
            </TouchableOpacity>

            {showAddChild && (
              <View style={styles.addChildForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Child's name"
                  value={newChildName}
                  onChangeText={setNewChildName}
                />
                <View style={styles.ageSelector}>
                  {['toddler', 'young', 'older'].map((age) => (
                    <TouchableOpacity
                      key={age}
                      style={[
                        styles.ageOption,
                        newChildAge === age && styles.ageOptionActive,
                      ]}
                      onPress={() => setNewChildAge(age)}
                    >
                      <Text style={styles.ageOptionText}>
                        {age === 'toddler' ? '4-5' : age === 'young' ? '6-8' : '9-12'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={addChild}>
                  <Text style={styles.submitButtonText}>Add Child</Text>
                </TouchableOpacity>
              </View>
            )}

            {children.map((child) => (
              <View key={child.id} style={styles.childCard}>
                <View style={styles.childInfo}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>
                    Age: {child.age_group === 'toddler' ? '4-5' : child.age_group === 'young' ? '6-8' : '9-12'}
                  </Text>
                </View>
                <View style={styles.childActions}>
                  <TouchableOpacity style={styles.childActionButton}>
                    <Text style={styles.childActionText}>Settings</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Safety Tab */}
        {activeTab === 'safety' && (
          <View>
            <Text style={styles.sectionTitle}>Safety Alerts</Text>
            {safetyEvents.length === 0 ? (
              <Text style={styles.emptyText}>No safety alerts</Text>
            ) : (
              safetyEvents.map((event) => (
                <View
                  key={event.id}
                  style={[
                    styles.safetyCard,
                    event.resolved && styles.safetyCardResolved,
                  ]}
                >
                  <View style={styles.safetyHeader}>
                    <Text style={[
                      styles.safetySeverity,
                      { color: event.severity === 'critical' ? '#F44336' : event.severity === 'high' ? '#FF9800' : '#FFC107' }
                    ]}>
                      {event.severity.toUpperCase()}
                    </Text>
                    <Text style={styles.safetyCategory}>{event.category}</Text>
                  </View>
                  <Text style={styles.safetyDetails}>
                    {JSON.stringify(event.details)}
                  </Text>
                  <Text style={styles.safetyTime}>
                    {new Date(event.created_at).toLocaleString()}
                  </Text>
                  {!event.resolved && (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => resolveSafetyEvent(event.id)}
                    >
                      <Text style={styles.resolveButtonText}>Mark Resolved</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <View>
            <Text style={styles.sectionTitle}>Recent Notifications</Text>
            {notifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications</Text>
            ) : (
              notifications.map((notif) => (
                <TouchableOpacity
                  key={notif.id}
                  style={[styles.notifCard, !notif.read && styles.notifUnread]}
                  onPress={() => markNotificationRead(notif.id)}
                >
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifBody}>{notif.body}</Text>
                  <Text style={styles.notifTime}>
                    {new Date(notif.created_at).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Auth Screen Component
function AuthScreen({ onSignUp, onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>Learna Parent App</Text>
      <Text style={styles.authSubtitle}>
        {isSignUp ? 'Create your account' : 'Sign in to manage your children'}
      </Text>

      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={fullName}
          onChangeText={setFullName}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.authButton}
        onPress={() => isSignUp ? onSignUp(email, password, fullName) : onSignIn(email, password)}
      >
        <Text style={styles.authButtonText}>
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => setIsSignUp(!isSignUp)}
      >
        <Text style={styles.switchButtonText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  signOutButton: {
    color: 'white',
    fontSize: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addChildForm: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  ageSelector: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  ageOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  ageOptionActive: {
    backgroundColor: '#4CAF50',
  },
  ageOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  childCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  childAge: {
    color: '#666',
    marginTop: 5,
  },
  childActions: {},
  childActionButton: {
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 5,
  },
  childActionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  safetyCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  safetyCardResolved: {
    opacity: 0.6,
    borderLeftColor: '#4CAF50',
  },
  safetyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  safetySeverity: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  safetyCategory: {
    fontWeight: 'bold',
  },
  safetyDetails: {
    color: '#666',
    marginBottom: 10,
  },
  safetyTime: {
    color: '#999',
    fontSize: 12,
  },
  resolveButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  resolveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  notifCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  notifUnread: {
    backgroundColor: '#E8F5E9',
  },
  notifTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  notifBody: {
    color: '#666',
    marginBottom: 5,
  },
  notifTime: {
    color: '#999',
    fontSize: 12,
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#4CAF50',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  authSubtitle: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 40,
  },
  authButton: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  authButtonText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 18,
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchButtonText: {
    color: 'white',
    fontSize: 16,
  },
});