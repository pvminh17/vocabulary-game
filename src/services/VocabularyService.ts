import { VocabularyWord } from '../types';
import vocabularyData from '../data/oxford_5000.json';

export class VocabularyService {
  private static words: VocabularyWord[] = Object.values(vocabularyData as Record<string, VocabularyWord>);

  static getAllWords(): VocabularyWord[] {
    return this.words;
  }

  static getWordsByDifficulty(difficulty: string): VocabularyWord[] {
    if (difficulty === 'all') {
      return this.words;
    }
    return this.words.filter(word => word.cefr.toLowerCase() === difficulty.toLowerCase());
  }

  static getRandomWord(difficulty: string = 'all'): VocabularyWord {
    const filteredWords = this.getWordsByDifficulty(difficulty);
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    return filteredWords[randomIndex];
  }

  static generateMultipleChoiceOptions(correctWord: VocabularyWord, difficulty: string = 'all'): string[] {
    const options = [correctWord.word];
    const availableWords = this.getWordsByDifficulty(difficulty)
      .filter(word => word.word !== correctWord.word)
      .filter(word => word.type === correctWord.type); // Same part of speech for better difficulty

    // If we don't have enough words of the same type, use any words
    const wordsToChooseFrom = availableWords.length >= 3 ? availableWords : 
      this.getWordsByDifficulty(difficulty).filter(word => word.word !== correctWord.word);

    while (options.length < 4 && wordsToChooseFrom.length > 0) {
      const randomIndex = Math.floor(Math.random() * wordsToChooseFrom.length);
      const word = wordsToChooseFrom[randomIndex];
      if (!options.includes(word.word)) {
        options.push(word.word);
      }
      wordsToChooseFrom.splice(randomIndex, 1);
    }

    // Shuffle the options
    return options.sort(() => Math.random() - 0.5);
  }

  static checkAnswer(userAnswer: string, correctAnswer: string): boolean {
    return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
  }

  static hideWordInExample(example: string, word: string): string {
    // Escape special regex characters in the word
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create patterns to match different word forms
    const patterns = [
      // Exact match
      `\\b${escapedWord}\\b`,
      // Plural forms (add 's' or 'es')
      `\\b${escapedWord}s\\b`,
      `\\b${escapedWord}es\\b`,
      // Past tense and past participle (add 'ed')
      `\\b${escapedWord}ed\\b`,
      // Present participle (add 'ing')
      `\\b${escapedWord}ing\\b`,
      // Comparative and superlative (add 'er', 'est')
      `\\b${escapedWord}er\\b`,
      `\\b${escapedWord}est\\b`,
    ];
    
    // Handle special cases for words ending in 'y' (change to 'ies')
    if (word.endsWith('y')) {
      const stemWithoutY = escapedWord.slice(0, -1);
      patterns.push(`\\b${stemWithoutY}ies\\b`);
    }
    
    // Handle words ending in 'e' (remove 'e' before adding 'ing' or 'ed')
    if (word.endsWith('e')) {
      const stemWithoutE = escapedWord.slice(0, -1);
      patterns.push(`\\b${stemWithoutE}ing\\b`);
      patterns.push(`\\b${stemWithoutE}ed\\b`);
    }
    
    // Combine all patterns into one regex
    const wordRegex = new RegExp(`(${patterns.join('|')})`, 'gi');
    
    // Replace the word with underscores matching the word length
    return example.replace(wordRegex, (match) => '_'.repeat(match.length));
  }
}
