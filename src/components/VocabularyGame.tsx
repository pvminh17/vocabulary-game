import React, { useState, useEffect } from 'react';
import { GameState, VocabularyWord } from '../types';
import { VocabularyService } from '../services/VocabularyService';
import './VocabularyGame.css';

const VocabularyGame: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    currentWord: null,
    score: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    gameStarted: false,
    showAnswer: false,
    userGuess: '',
    isCorrect: null,
    difficulty: 'all'
  });

  const [gameMode, setGameMode] = useState<'typing' | 'multiple-choice'>('typing');
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState<string[]>([]);

  useEffect(() => {
    // Load best streak from localStorage
    const savedBestStreak = localStorage.getItem('vocabularyBestStreak');
    if (savedBestStreak) {
      setGameState(prev => ({ ...prev, bestStreak: parseInt(savedBestStreak) }));
    }
  }, []);

  const startGame = () => {
    const newWord = VocabularyService.getRandomWord(gameState.difficulty);
    const options = gameMode === 'multiple-choice' ? 
      VocabularyService.generateMultipleChoiceOptions(newWord, gameState.difficulty) : [];
    
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      currentWord: newWord,
      showAnswer: false,
      userGuess: '',
      isCorrect: null
    }));
    setMultipleChoiceOptions(options);
  };

  const nextQuestion = () => {
    const newWord = VocabularyService.getRandomWord(gameState.difficulty);
    const options = gameMode === 'multiple-choice' ? 
      VocabularyService.generateMultipleChoiceOptions(newWord, gameState.difficulty) : [];
    
    setGameState(prev => ({
      ...prev,
      currentWord: newWord,
      showAnswer: false,
      userGuess: '',
      isCorrect: null
    }));
    setMultipleChoiceOptions(options);
  };

  const submitAnswer = (answer?: string) => {
    const userAnswer = answer || gameState.userGuess;
    if (!gameState.currentWord || !userAnswer.trim()) return;

    const isCorrect = VocabularyService.checkAnswer(userAnswer, gameState.currentWord.word);
    const newStreak = isCorrect ? gameState.currentStreak + 1 : 0;
    const newBestStreak = Math.max(gameState.bestStreak, newStreak);

    // Save best streak to localStorage
    if (newBestStreak > gameState.bestStreak) {
      localStorage.setItem('vocabularyBestStreak', newBestStreak.toString());
    }

    setGameState(prev => ({
      ...prev,
      showAnswer: true,
      isCorrect,
      score: isCorrect ? prev.score + 10 : prev.score,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalQuestions: prev.totalQuestions + 1,
      correctAnswers: isCorrect ? prev.correctAnswers + 1 : prev.correctAnswers
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      currentStreak: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      gameStarted: false,
      currentWord: null,
      showAnswer: false,
      userGuess: '',
      isCorrect: null
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !gameState.showAnswer) {
      submitAnswer();
    } else if (e.key === 'Enter' && gameState.showAnswer) {
      nextQuestion();
    }
  };

  const getDifficultyColor = (cefr: string) => {
    const colors = {
      a1: '#4CAF50', // Green
      a2: '#8BC34A', // Light Green
      b1: '#FFC107', // Amber
      b2: '#FF9800', // Orange
      c1: '#FF5722', // Deep Orange
      c2: '#F44336'  // Red
    };
    return colors[cefr.toLowerCase() as keyof typeof colors] || '#666';
  };

  if (!gameState.gameStarted) {
    return (
      <div className="game-container">
        <div className="welcome-screen">
          <h1>🎯 Vocabulary Challenge</h1>
          <p>Guess the word based on its definition!</p>
          
          <div className="game-settings">
            <div className="setting-group">
              <label>Difficulty Level:</label>
              <select 
                value={gameState.difficulty} 
                onChange={(e) => setGameState(prev => ({ ...prev, difficulty: e.target.value as any }))}
              >
                <option value="all">All Levels</option>
                <option value="a1">A1 (Beginner)</option>
                <option value="a2">A2 (Elementary)</option>
                <option value="b1">B1 (Intermediate)</option>
                <option value="b2">B2 (Upper-Intermediate)</option>
                <option value="c1">C1 (Advanced)</option>
                <option value="c2">C2 (Proficient)</option>
              </select>
            </div>
            
            <div className="setting-group">
              <label>Game Mode:</label>
              <select 
                value={gameMode} 
                onChange={(e) => setGameMode(e.target.value as 'typing' | 'multiple-choice')}
              >
                <option value="typing">Type the Answer</option>
                <option value="multiple-choice">Multiple Choice</option>
              </select>
            </div>
          </div>

          <div className="stats-preview">
            <div className="stat">
              <span className="stat-value">{gameState.bestStreak}</span>
              <span className="stat-label">Best Streak</span>
            </div>
          </div>

          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{gameState.score}</span>
            <span className="stat-label">Score</span>
          </div>
          <div className="stat">
            <span className="stat-value">{gameState.currentStreak}</span>
            <span className="stat-label">Streak</span>
          </div>
          <div className="stat">
            <span className="stat-value">{gameState.totalQuestions > 0 ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) : 0}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>
        <button className="reset-button" onClick={resetGame}>New Game</button>
      </div>

      {gameState.currentWord && (
        <div className="game-content">
          <div className="word-info">
            <div className="word-meta">
              <span className="word-type">{gameState.currentWord.type}</span>
              <span 
                className="word-level" 
                style={{ backgroundColor: getDifficultyColor(gameState.currentWord.cefr) }}
              >
                {gameState.currentWord.cefr.toUpperCase()}
              </span>
            </div>
            <div className="definition">
              <h2>Definition:</h2>
              <p>{gameState.currentWord.definition}</p>
            </div>
            <div className="example">
              <h3>Example:</h3>
              <p>{VocabularyService.hideWordInExample(gameState.currentWord.example, gameState.currentWord.word)}</p>
            </div>
          </div>

          <div className="answer-section">
            {gameMode === 'typing' ? (
              <div className="typing-mode">
                <input
                  type="text"
                  value={gameState.userGuess}
                  onChange={(e) => setGameState(prev => ({ ...prev, userGuess: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your answer here..."
                  disabled={gameState.showAnswer}
                  className={gameState.showAnswer ? (gameState.isCorrect ? 'correct' : 'incorrect') : ''}
                />
                {!gameState.showAnswer && (
                  <button onClick={() => submitAnswer()} disabled={!gameState.userGuess.trim()}>
                    Submit
                  </button>
                )}
              </div>
            ) : (
              <div className="multiple-choice-mode">
                {multipleChoiceOptions.map((option, index) => (
                  <button
                    key={index}
                    className={`choice-button ${
                      gameState.showAnswer
                        ? option === gameState.currentWord?.word
                          ? 'correct'
                          : gameState.userGuess === option
                          ? 'incorrect'
                          : ''
                        : ''
                    }`}
                    onClick={() => {
                      setGameState(prev => ({ ...prev, userGuess: option }));
                      submitAnswer(option);
                    }}
                    disabled={gameState.showAnswer}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {gameState.showAnswer && (
              <div className="answer-feedback">
                <div className={`feedback ${gameState.isCorrect ? 'correct' : 'incorrect'}`}>
                  {gameState.isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
                </div>
                <div className="correct-answer">
                  <strong>Answer:</strong> {gameState.currentWord.word}
                  <span className="pronunciation">
                    /{gameState.currentWord.phon_br}/
                  </span>
                </div>
                <button className="next-button" onClick={nextQuestion} onKeyPress={handleKeyPress}>
                  Next Question →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyGame;
