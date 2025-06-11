import { VocabularyWord, WordProgress, LearningSession, UserProgress } from '../types';
import { VocabularyService } from './VocabularyService';

export class LearningService {
  private static readonly STORAGE_KEY = 'vocabularyLearningData';
  private static readonly MASTERY_THRESHOLD = 3; // Correct answers needed to master a word
  private static readonly DEFAULT_LEARNING_POOL_SIZE = 10;

  static getUserProgress(): UserProgress {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      if (data.learningSession?.sessionStarted) {
        data.learningSession.sessionStarted = new Date(data.learningSession.sessionStarted);
      }
      Object.keys(data.wordProgress || {}).forEach(word => {
        if (data.wordProgress[word].lastSeen) {
          data.wordProgress[word].lastSeen = new Date(data.wordProgress[word].lastSeen);
        }
      });
      return data;
    }

    return this.createDefaultUserProgress();
  }

  static saveUserProgress(progress: UserProgress): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progress));
  }

  static createDefaultUserProgress(): UserProgress {
    return {
      wordProgress: {},
      learningSession: {
        wordsToLearn: [],
        maxLearningWords: this.DEFAULT_LEARNING_POOL_SIZE,
        totalWordsLearned: 0,
        sessionStarted: new Date(),
        currentSessionCorrect: 0,
        currentSessionTotal: 0
      },
      stats: {
        totalPlayed: 0,
        correctAnswers: 0,
        accuracy: 0,
        bestStreak: 0
      }
    };
  }

  static initializeLearningSession(difficulty: string, maxWords: number = this.DEFAULT_LEARNING_POOL_SIZE): UserProgress {
    const progress = this.getUserProgress();
    
    if (progress.learningSession.wordsToLearn.length === 0) {
      // Get initial words for learning
      const availableWords = VocabularyService.getWordsByDifficulty(difficulty);
      const unlearned = availableWords.filter(word => 
        !progress.wordProgress[word.word]?.mastered
      );
      
      const initialWords = unlearned
        .slice(0, maxWords)
        .map(word => word.word);

      progress.learningSession = {
        ...progress.learningSession,
        wordsToLearn: initialWords,
        maxLearningWords: maxWords,
        sessionStarted: new Date(),
        currentSessionCorrect: 0,
        currentSessionTotal: 0
      };
    }

    this.saveUserProgress(progress);
    return progress;
  }

  static getNextLearningWord(difficulty: string): VocabularyWord | null {
    const progress = this.getUserProgress();
    const { wordsToLearn } = progress.learningSession;

    if (wordsToLearn.length === 0) {
      return null;
    }

    // Prioritize words that haven't been seen yet, then least recently seen
    const wordStats = wordsToLearn.map(word => ({
      word,
      progress: progress.wordProgress[word] || this.createDefaultWordProgress(word)
    }));

    // Sort by mastery level (ascending), then by last seen (ascending)
    wordStats.sort((a, b) => {
      if (a.progress.masteryLevel !== b.progress.masteryLevel) {
        return a.progress.masteryLevel - b.progress.masteryLevel;
      }
      return a.progress.lastSeen.getTime() - b.progress.lastSeen.getTime();
    });

    const selectedWord = wordStats[0].word;
    const allWords = VocabularyService.getAllWords();
    return allWords.find(w => w.word === selectedWord) || null;
  }

  static recordAnswer(word: string, isCorrect: boolean, difficulty: string): UserProgress {
    const progress = this.getUserProgress();
    
    if (!progress.wordProgress[word]) {
      progress.wordProgress[word] = this.createDefaultWordProgress(word);
    }

    const wordProgress = progress.wordProgress[word];
    wordProgress.lastSeen = new Date();

    if (isCorrect) {
      wordProgress.correctCount++;
      wordProgress.masteryLevel = Math.min(5, wordProgress.masteryLevel + 1);
      progress.learningSession.currentSessionCorrect++;
    } else {
      wordProgress.incorrectCount++;
      wordProgress.masteryLevel = Math.max(0, wordProgress.masteryLevel - 1);
    }

    progress.learningSession.currentSessionTotal++;

    // Check if word is mastered
    if (wordProgress.correctCount >= this.MASTERY_THRESHOLD && wordProgress.masteryLevel >= 4) {
      wordProgress.mastered = true;
      this.removeFromLearningPool(word, progress);
      this.addNewWordToPool(difficulty, progress);
    }

    // Update global stats
    progress.stats.totalPlayed++;
    if (isCorrect) {
      progress.stats.correctAnswers++;
    }
    progress.stats.accuracy = (progress.stats.correctAnswers / progress.stats.totalPlayed) * 100;

    this.saveUserProgress(progress);
    return progress;
  }

  private static createDefaultWordProgress(word: string): WordProgress {
    return {
      word,
      correctCount: 0,
      incorrectCount: 0,
      lastSeen: new Date(),
      mastered: false,
      masteryLevel: 0
    };
  }

  private static removeFromLearningPool(word: string, progress: UserProgress): void {
    progress.learningSession.wordsToLearn = progress.learningSession.wordsToLearn.filter(w => w !== word);
    progress.learningSession.totalWordsLearned++;
  }

  private static addNewWordToPool(difficulty: string, progress: UserProgress): void {
    const { wordsToLearn, maxLearningWords } = progress.learningSession;
    
    if (wordsToLearn.length >= maxLearningWords) {
      return; // Pool is full
    }

    const availableWords = VocabularyService.getWordsByDifficulty(difficulty);
    const unlearned = availableWords.filter(word => 
      !progress.wordProgress[word.word]?.mastered && 
      !wordsToLearn.includes(word.word)
    );

    if (unlearned.length > 0) {
      const newWord = unlearned[Math.floor(Math.random() * unlearned.length)];
      wordsToLearn.push(newWord.word);
    }
  }

  static getLearningStats(progress: UserProgress): {
    wordsInProgress: number;
    wordsMastered: number;
    totalWordsLearned: number;
    sessionAccuracy: number;
    averageMasteryLevel: number;
  } {
    const { wordsToLearn, currentSessionCorrect, currentSessionTotal, totalWordsLearned } = progress.learningSession;
    const wordProgress = Object.values(progress.wordProgress);
    const masteredWords = wordProgress.filter(wp => wp.mastered).length;
    const sessionAccuracy = currentSessionTotal > 0 ? (currentSessionCorrect / currentSessionTotal) * 100 : 0;
    
    const totalMasteryLevel = wordProgress.reduce((sum, wp) => sum + wp.masteryLevel, 0);
    const averageMasteryLevel = wordProgress.length > 0 ? totalMasteryLevel / wordProgress.length : 0;

    return {
      wordsInProgress: wordsToLearn.length,
      wordsMastered: masteredWords,
      totalWordsLearned,
      sessionAccuracy,
      averageMasteryLevel
    };
  }

  static resetLearningSession(): void {
    const progress = this.createDefaultUserProgress();
    this.saveUserProgress(progress);
  }

  static updateLearningPoolSize(newSize: number, difficulty: string): UserProgress {
    const progress = this.getUserProgress();
    progress.learningSession.maxLearningWords = newSize;
    
    // Adjust current pool if needed
    const { wordsToLearn } = progress.learningSession;
    
    if (wordsToLearn.length < newSize) {
      // Add more words
      const availableWords = VocabularyService.getWordsByDifficulty(difficulty);
      const unlearned = availableWords.filter(word => 
        !progress.wordProgress[word.word]?.mastered && 
        !wordsToLearn.includes(word.word)
      );

      const wordsToAdd = Math.min(newSize - wordsToLearn.length, unlearned.length);
      for (let i = 0; i < wordsToAdd; i++) {
        const randomIndex = Math.floor(Math.random() * unlearned.length);
        wordsToLearn.push(unlearned[randomIndex].word);
        unlearned.splice(randomIndex, 1);
      }
    } else if (wordsToLearn.length > newSize) {
      // Remove excess words (keep the ones with lower mastery levels)
      const wordStats = wordsToLearn.map(word => ({
        word,
        masteryLevel: progress.wordProgress[word]?.masteryLevel || 0
      }));
      
      wordStats.sort((a, b) => a.masteryLevel - b.masteryLevel);
      progress.learningSession.wordsToLearn = wordStats.slice(0, newSize).map(ws => ws.word);
    }

    this.saveUserProgress(progress);
    return progress;
  }
}
