import { AgeGroup } from '../types';

export interface AgeGroupConfig {
  id: AgeGroup;
  label: string;
  ageRange: string;
  maxResponseLength: number;
  vocabularyLevel: 'simple' | 'moderate' | 'complex';
  topics: string[];
  avoidTopics: string[];
}

export const AGE_GROUP_CONFIGS: Record<AgeGroup, AgeGroupConfig> = {
  toddler: {
    id: 'toddler',
    label: 'Little',
    ageRange: '4-5 years',
    maxResponseLength: 50,
    vocabularyLevel: 'simple',
    topics: ['friendship', 'feelings', 'nature', 'animals', 'stories', 'games', 'songs'],
    avoidTopics: ['death', 'violence', 'scary things', 'complex emotions'],
  },
  young: {
    id: 'young',
    label: 'Growing',
    ageRange: '6-8 years',
    maxResponseLength: 100,
    vocabularyLevel: 'moderate',
    topics: ['friendship', 'feelings', 'nature', 'animals', 'stories', 'games', 'school', 'creativity'],
    avoidTopics: ['death', 'violence', 'drugs', 'adult topics'],
  },
  older: {
    id: 'older',
    label: 'Big Kid',
    ageRange: '9-12 years',
    maxResponseLength: 200,
    vocabularyLevel: 'complex',
    topics: ['friendship', 'feelings', 'nature', 'stories', 'creativity', 'school', 'hobbies', 'sports'],
    avoidTopics: ['explicit content', 'illegal activities'],
  },
};

export const AGE_GROUP_OPTIONS = [
  { id: 'toddler' as AgeGroup, label: '4-5 years', description: 'Simple conversations' },
  { id: 'young' as AgeGroup, label: '6-8 years', description: 'Growing vocabulary' },
  { id: 'older' as AgeGroup, label: '9-12 years', description: 'More complex chats' },
];