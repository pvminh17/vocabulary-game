export interface VocabularyWord {
  word: string;
  type: string;
  cefr: string;
  phon_br: string;
  phon_n_am: string;
  definition: string;
  example: string;
  uk: string;
  us: string;
}

export interface WordProgress {
  word: string;
  correctCount: number;
  incorrectCount: number;
  lastSeen: Date;
  mastered: boolean;
  masteryLevel: number; // 0-5, 5 means fully mastered
}

export interface LearningSession {
  wordsToLearn: string[]; // words currently in learning pool
  maxLearningWords: number; // how many words to learn at once
  totalWordsLearned: number;
  sessionStarted: Date;
  currentSessionCorrect: number;
  currentSessionTotal: number;
}

export interface UserProgress {
  wordProgress: Record<string, WordProgress>;
  learningSession: LearningSession;
  stats: GameStats;
}

export interface GameState {
  currentWord: VocabularyWord | null;
  score: number;
  currentStreak: number;
  bestStreak: number;
  totalQuestions: number;
  correctAnswers: number;
  gameStarted: boolean;
  showAnswer: boolean;
  userGuess: string;
  isCorrect: boolean | null;
  difficulty: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2' | 'all';
  mode: 'practice' | 'learning'; // Add learning mode
}

export interface GameStats {
  totalPlayed: number;
  correctAnswers: number;
  accuracy: number;
  bestStreak: number;
}
