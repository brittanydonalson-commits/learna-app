import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LearnaTree } from '../components/LearnaTree';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <View style={styles.container}>
      <View style={styles.treeContainer}>
        <LearnaTree state="happy" size={180} />
      </View>
      
      <Text style={styles.title}>Hi! I'm Learna!</Text>
      <Text style={styles.subtitle}>
        Your friend who's always here to chat
      </Text>

      <TouchableOpacity style={styles.button} onPress={onStart}>
        <Text style={styles.buttonText}>Let's talk!</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  treeContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#a5d6a7',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});