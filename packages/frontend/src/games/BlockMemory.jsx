import React, { useState, useEffect } from 'react';
import ScoreSubmit from '../components/ScoreSubmit';
import './BlockMemory.css';

const ICONS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🍒', '🥭', '🍍', '🥝', '🥥'];

export default function BlockMemory() {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(60);
  const [level, setLevel] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const startGame = () => {
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setGameOver(false);
    setIsPlaying(true);
    generateBoard(1);
  };

  const generateBoard = (currentLevel) => {
    // Increase pairs based on level, start with 6 pairs, max out at 10 pairs (20 cards)
    const pairsCount = Math.min(5 + currentLevel, 10);
    const selectedIcons = ICONS.slice(0, pairsCount);
    const deck = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon }));
      
    setCards(deck);
    setFlippedIndices([]);
    setMatchedIndices(new Set());
  };

  // Timer
  useEffect(() => {
    let timer;
    if (isPlaying && !gameOver && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setGameOver(true);
      setIsPlaying(false);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gameOver, timeLeft]);

  // Level Complete Logic
  useEffect(() => {
    if (isPlaying && cards.length > 0 && matchedIndices.size === cards.length) {
      setIsProcessing(true);
      setTimeout(() => {
        setScore(s => s + (level * 100) + (timeLeft * 10)); // Bonus for time left
        
        if (level >= 5) {
          // Player beat all 5 levels! End game early with huge bonus
          setScore(s => s + 1000); 
          setGameOver(true);
          setIsPlaying(false);
        } else {
          setTimeLeft(prev => prev + 5); // Add only 5 seconds for clearing board so they don't play forever
          setLevel(l => l + 1);
          generateBoard(level + 1);
          setIsProcessing(false);
        }
      }, 1000);
    }
  }, [matchedIndices.size, cards.length, isPlaying]);

  const handleCardClick = (index) => {
    if (isProcessing || flippedIndices.includes(index) || matchedIndices.has(index) || gameOver || !isPlaying) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        // Match found
        setMatchedIndices(prev => new Set(prev).add(first).add(second));
        setScore(s => s + 10);
        setIsProcessing(false);
      } else {
        // No match
        setTimeout(() => {
          setFlippedIndices([]);
          setIsProcessing(false);
        }, 800); // slightly faster flip back
      }
    }
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Block Memory</h2>
        <p className="text-secondary">Match pairs before time runs out!</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', minHeight: '500px' }}>
        {!isPlaying && !gameOver && (
          <div className="glass-panel" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10, padding: '40px', textAlign: 'center' }}>
            <h3>Ready to flip?</h3>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: '10%', zIndex: 10, width: '100%' }}>
            <ScoreSubmit gameId={2} score={score} onRestart={startGame} />
          </div>
        )}

        {(isPlaying || gameOver) && (
          <div className="game-area" style={{ width: '100%', maxWidth: '600px', opacity: gameOver ? 0.3 : 1 }}>
            <div className="game-stats glass-panel" style={{ padding: '15px 30px', marginBottom: '30px', borderRadius: '16px', background: 'rgba(10, 10, 15, 0.6)' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Level</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Space Grotesk' }}>{level}</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Score</span>
                <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Space Grotesk' }}>{score}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block' }}>Time</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', fontFamily: 'Space Grotesk', color: timeLeft <= 10 ? '#ff3366' : 'white', textShadow: timeLeft <= 10 ? '0 0 10px rgba(255,51,102,0.5)' : 'none' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            <div className="memory-grid">
              {cards.map((card, idx) => {
                const isFlipped = flippedIndices.includes(idx) || matchedIndices.has(idx);
                return (
                  <div 
                    key={card.id} 
                    className={`memory-card ${isFlipped ? 'flipped' : ''} ${matchedIndices.has(idx) ? 'matched' : ''}`}
                    onClick={() => handleCardClick(idx)}
                  >
                    <div className="card-inner">
                      <div className="card-front">
                        {/* Hidden state */}
                      </div>
                      <div className="card-back">
                        {card.icon}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
