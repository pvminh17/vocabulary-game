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
}

export interface GameStats {
  totalPlayed: number;
  correctAnswers: number;
  accuracy: number;
  bestStreak: number;
}
