import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AgePicker } from '../components/AgePicker';
import { AgeGroup } from '../types';

interface SetupScreenProps {
  onComplete: (name: string, ageGroup: AgeGroup) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [step, setStep] = useState<'name' | 'age'>('name');

  const handleNext = () => {
    if (step === 'name' && name.trim()) {
      setStep('age');
    } else if (step === 'age' && ageGroup) {
      onComplete(name.trim(), ageGroup);
    }
  };

  const isValid = step === 'name' 
    ? name.trim().length > 0 
    : ageGroup !== null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {step === 'name' ? (
          <>
            <Text style={styles.title}>What's your name?</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#999"
              autoFocus
              autoCapitalize="words"
              maxLength={20}
            />
          </>
        ) : (
          <>
            <AgePicker selectedAge={ageGroup} onSelect={setAgeGroup} />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, !isValid && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>
            {step === 'name' ? 'Next' : "Let's go!"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#66bb6a',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#4a6741',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});