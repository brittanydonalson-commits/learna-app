import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

// Age-appropriate responses based on age group
const AGE_GROUPS = {
  toddler: { // 4-5 years
    maxResponseLength: 50,
    vocabulary: 'simple',
    topics: ['friends', 'feelings', 'stories', 'animals', 'nature', 'colors'],
  },
  young: { // 6-8 years
    maxResponseLength: 100,
    vocabulary: 'moderate',
    topics: ['friends', 'feelings', 'stories', 'animals', 'nature', 'school', 'hobbies'],
  },
  older: { // 9-12 years
    maxResponseLength: 200,
    vocabulary: 'complex',
    topics: ['friends', 'feelings', 'stories', 'school', 'hobbies', 'sports', 'books'],
  },
};

// Learna's personality based on age group
const getLearnaPersonality = (ageGroup) => {
  const personalities = {
    toddler: {
      greeting: "Hi friend! I'm Learna! 🌱",
      style: 'playful',
      questions: [
        "What's your favorite color?",
        "Do you have a pet?",
        "What's your favorite animal?",
        "Want to hear a story about a friendly squirrel?",
      ],
    },
    young: {
      greeting: "Hey there! I'm Learna, your friend! 🌳",
      style: 'friendly',
      questions: [
        "What's the best thing that happened today?",
        "Did you learn anything cool lately?",
        "What's your favorite thing to do for fun?",
        "Want to play a imagination game?",
      ],
    },
    older: {
      greeting: "Hi! I'm Learna. What's up? 🌲",
      style: 'casual',
      questions: [
        "How's everything going?",
        "What's on your mind?",
        "Anything exciting happen recently?",
        "Want to chat about something specific?",
      ],
    },
  };
  return personalities[ageGroup] || personalities.young;
};

export default function KidApp() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [childId, setChildId] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [treeStage, setTreeStage] = useState(0); // 0: seed, 1: sprout, 2: sapling, 3: tree
  const [ageGroup, setAgeGroup] = useState('young');

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const soundwaveAnim = useRef(new Animated.Value(0)).current;

  // Animation effects
  useEffect(() => {
    // Pulse animation when idle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isListening) {
      // Bounce animation when listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -10,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.setValue(0);
    }
  }, [isListening]);

  // Initialize - get child from storage or create
  useEffect(() => {
    initializeChild();
  }, []);

  const initializeChild = async () => {
    try {
      // For now, create or get first child (in real app, parent sets this up)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // Demo mode - no auth yet
        setAgeGroup('young');
        return;
      }

      const { data: children } = await supabase
        .from('children')
        .select('*')
        .limit(1);

      if (children && children.length > 0) {
        setChildId(children[0].id);
        setAgeGroup(children[0].age_group);
      }
    } catch (error) {
      console.log('Using demo mode');
      setAgeGroup('young');
    }
  };

  const startConversation = async () => {
    try {
      // Create new conversation
      if (childId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ child_id: childId })
          .select()
          .single();

        if (!error && data) {
          setConversationId(data.id);
        }
      }

      // Add Learna's greeting
      const personality = getLearnaPersonality(ageGroup);
      const greeting = {
        role: 'learna',
        content: personality.greeting,
      };
      setConversation([greeting]);

      // Ask first question after a delay
      setTimeout(() => {
        const randomQuestion = personality.questions[Math.floor(Math.random() * personality.questions.length)];
        addLearnaMessage(randomQuestion);
      }, 1500);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const addLearnaMessage = (content) => {
    const newMessage = { role: 'learna', content };
    setConversation(prev => [...prev, newMessage]);

    // Speak the message
    speakMessage(content);
  };

  const handleVoicePress = async () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = async () => {
    try {
      setIsListening(true);

      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Audio permission not granted');
        return;
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // In a real app, start speech recognition here
      // For demo, simulate listening
      setTimeout(() => {
        stopListening();
        // Simulate child response for demo
        handleChildResponse("I like dinosaurs!");
      }, 3000);

    } catch (error) {
      console.error('Error starting to listen:', error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      setIsListening(false);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (error) {
      console.error('Error stopping listen:', error);
    }
  };

  const handleChildResponse = async (text) => {
    // Add child's message
    const childMessage = { role: 'child', content: text };
    setConversation(prev => [...prev, childMessage]);

    // Save to database
    if (conversationId) {
      await supabase.from('messages').insert({
        conversation_id: conversationId,
        role: 'child',
        content: text,
      });
    }

    // Get Learna's response
    setIsSpeaking(true);
    const response = await getLearnaResponse(text);
    setIsSpeaking(false);

    addLearnaMessage(response);
  };

  const getLearnaResponse = async (childMessage) => {
    const personality = getLearnaPersonality(ageGroup);
    const ageConfig = AGE_GROUPS[ageGroup];

    // In production, this would call an edge function with OpenRouter
    // For now, use simple responses based on keywords

    const message = childMessage.toLowerCase();

    // Simple keyword matching
    if (message.includes('sad') || message.includes('upset') || message.includes('cry')) {
      return "Oh no! I'm sorry you're feeling sad. Do you want to talk about it? 🌧️";
    }
    if (message.includes('happy') || message.includes('excited') || message.includes('fun')) {
      return "Yay! That makes me happy too! 😄 Tell me more!";
    }
    if (message.includes('scared') || message.includes('afraid') || message.includes('monster')) {
      return "You know what? I'm here with you and you're safe. Want me to tell you about a brave knight? 🛡️";
    }
    if (message.includes('friend') || message.includes('play')) {
      return "You bet we can play! I'm your friend! 💚 What do you want to do?";
    }
    if (message.includes('story')) {
      return "Once upon a time, in a magical forest...";
    }
    if (message.includes('animal') || message.includes('dog') || message.includes('cat')) {
      return "Animals are the best! Do you have a favorite animal? 🦁";
    }

    // Default - ask a follow-up question
    const randomQuestion = personality.questions[Math.floor(Math.random() * personality.questions.length)];
    return randomQuestion;
  };

  const speakMessage = async (text) => {
    setIsSpeaking(true);
    // In production, call ElevenLabs TTS here
    // For demo, just simulate speaking
    setTimeout(() => {
      setIsSpeaking(false);
    }, 2000);
  };

  // Render tree character based on stage
  const renderTree = () => {
    const treeEmojis = ['🌱', '🌿', '🪴', '🌳'];
    const treeColors = ['#90EE90', '#98FB98', '#3CB371', '#228B22'];

    return (
      <Animated.View style={[styles.treeContainer, { transform: [{ scale: pulseAnim }] }]}>
        <Text style={[styles.treeEmoji, { fontSize: 80 + (treeStage * 20) }]}>
          {treeEmojis[treeStage]}
        </Text>
        {isListening && (
          <Animated.View style={[styles.listeningIndicator, { transform: [{ translateY: bounceAnim }] }]}>
            <Text style={styles.listeningText}>Listening...</Text>
          </Animated.View>
        )}
        {isSpeaking && (
          <View style={styles.speakingIndicator}>
            <Text style={styles.speakingText}>Learna is talking...</Text>
          </View>
        )}
      </Animated.View>
    );
  };

  // Render conversation bubbles
  const renderConversation = () => {
    return conversation.map((msg, index) => (
      <View
        key={index}
        style={[
          styles.messageBubble,
          msg.role === 'child' ? styles.childBubble : styles.learnaBubble,
        ]}
      >
        <Text style={[
          styles.messageText,
          msg.role === 'child' ? styles.childText : styles.learnaText,
        ]}>
          {msg.content}
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      {/* Tree Character */}
      {renderTree()}

      {/* Conversation */}
      <View style={styles.conversationContainer}>
        {conversation.length === 0 ? (
          <TouchableOpacity style={styles.startButton} onPress={startConversation}>
            <Text style={styles.startButtonText}>Tap to Talk to Learna! 🌳</Text>
          </TouchableOpacity>
        ) : (
          renderConversation()
        )}
      </View>

      {/* Voice Button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          isListening && styles.voiceButtonActive,
        ]}
        onPress={handleVoicePress}
      >
        <View style={styles.voiceButtonInner}>
          <Text style={styles.voiceButtonEmoji}>🎤</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F5E9',
  },
  treeContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  treeEmoji: {
    textAlign: 'center',
  },
  listeningIndicator: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  listeningText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  speakingIndicator: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  speakingText: {
    color: 'white',
    fontSize: 16,
  },
  conversationContainer: {
    flex: 1,
    padding: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  childBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#FFF',
    borderBottomRightRadius: 5,
  },
  learnaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#C8E6C9',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  childText: {
    color: '#333',
  },
  learnaText: {
    color: '#1B5E20',
  },
  startButton: {
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 30,
    marginTop: 100,
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  voiceButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  voiceButtonActive: {
    backgroundColor: '#F44336',
  },
  voiceButtonInner: {
    alignItems: 'center',
  },
  voiceButtonEmoji: {
    fontSize: 36,
  },
});