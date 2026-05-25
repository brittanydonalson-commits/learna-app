import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { AgeGroup } from '../types';
import { AGE_GROUP_OPTIONS } from '../constants/ageGroups';

interface AgePickerProps {
  selectedAge: AgeGroup | null;
  onSelect: (age: AgeGroup) => void;
}

export const AgePicker: React.FC<AgePickerProps> = ({
  selectedAge,
  onSelect,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How old are you?</Text>
      <View style={styles.options}>
        {AGE_GROUP_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selectedAge === option.id && styles.optionSelected,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text
              style={[
                styles.optionLabel,
                selectedAge === option.id && styles.optionLabelSelected,
              ]}
            >
              {option.label}
            </Text>
            <Text
              style={[
                styles.optionDescription,
                selectedAge === option.id && styles.optionDescriptionSelected,
              ]}
            >
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d5a27',
    textAlign: 'center',
    marginBottom: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: '#e8f5e9',
    borderColor: '#66bb6a',
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#2d5a27',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  optionDescriptionSelected: {
    color: '#4caf50',
  },
});