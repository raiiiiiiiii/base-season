import React, { useState, useEffect, useRef } from 'react';
import ScoreSubmit from '../components/ScoreSubmit';
import './PrecisionTap.css';

export default function PrecisionTap() {
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [position, setPosition] = useState(0); // 0 to 100
  const speedRef = useRef(1.5);
  const directionRef = useRef(1);
  const [speedUI, setSpeedUI] = useState(1.5); // just for UI or logic if needed
  
  const [targetCenter, setTargetCenter] = useState(50);
  const [targetWidth, setTargetWidth] = useState(20);
  
  const [feedback, setFeedback] = useState(null); // 'Perfect', 'Good', 'Miss'
  
  const requestRef = useRef();

  const startGame = () => {
    setScore(0);
    speedRef.current = 1.5;
    directionRef.current = 1;
    setSpeedUI(1.5);
    setTargetWidth(20);
    setTargetCenter(Math.random() * 60 + 20); // 20 to 80
    setGameOver(false);
    setFeedback(null);
    setIsPlaying(true);
  };

  const updatePosition = () => {
    if (!isPlaying) return;
    
    setPosition(prev => {
      let nextPos = prev + (speedRef.current * directionRef.current);
      if (nextPos >= 100) {
        directionRef.current = -1;
        nextPos = 100 - (nextPos - 100);
      } else if (nextPos <= 0) {
        directionRef.current = 1;
        nextPos = -nextPos;
      }
      return nextPos;
    });
    
    requestRef.current = requestAnimationFrame(updatePosition);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updatePosition);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]); // Only run when isPlaying changes

  const handleTap = () => {
    if (!isPlaying || gameOver) return;
    
    const targetMin = targetCenter - targetWidth / 2;
    const targetMax = targetCenter + targetWidth / 2;
    
    // Check if within bounds
    if (position >= targetMin && position <= targetMax) {
      // Hit!
      const distanceToCenter = Math.abs(position - targetCenter);
      let addedScore = 10;
      
      if (distanceToCenter < targetWidth / 6) {
        setFeedback('Perfect!');
        addedScore = 50;
      } else if (distanceToCenter < targetWidth / 3) {
        setFeedback('Great!');
        addedScore = 30;
      } else {
        setFeedback('Good');
        addedScore = 10;
      }
      
      setScore(s => s + addedScore);
      
      // Make game harder
      const newSpeed = Math.min(speedRef.current + 0.3, 5);
      speedRef.current = newSpeed;
      setSpeedUI(newSpeed);
      setTargetWidth(w => Math.max(w - 1, 5));
      setTargetCenter(Math.random() * (100 - targetWidth) + targetWidth/2);
      
      // Clear feedback after 1s
      setTimeout(() => setFeedback(null), 1000);
      
    } else {
      // Miss -> Game over
      setFeedback('Miss!');
      setIsPlaying(false);
      setTimeout(() => setGameOver(true), 500);
    }
  };
  
  // Also support spacebar to tap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying) handleTap();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, position]); // position must be in dep array to capture current val on press

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '12px' }}>Precision <span className="text-gradient">Tap</span></h2>
        <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Click or tap when the line is perfectly inside the target zone</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {!isPlaying && !gameOver && (
          <div className="glass-panel animate-fade-up" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10, padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Ready to test your timing?</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Pixel-perfect clicks earn more points!</p>
            <button className="btn-primary glow-hover" onClick={startGame}>Start Game</button>
          </div>
        )}

        {gameOver && (
          <div style={{ position: 'absolute', top: '10%', zIndex: 10, width: '100%' }}>
            <ScoreSubmit gameId={3} score={score} onRestart={startGame} />
          </div>
        )}

        <div className="pt-game-area glass-panel" onClick={handleTap} style={{ opacity: gameOver ? 0.3 : 1 }}>
          <div className="pt-score" style={{ background: 'rgba(10, 10, 15, 0.6)', padding: '10px 20px', borderRadius: '12px', display: 'inline-block', marginBottom: '40px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>Score</span>
            <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'Space Grotesk' }}>{score}</span>
          </div>
          
          {feedback && (
            <div className={`pt-feedback ${feedback === 'Miss!' ? 'miss' : 'hit'}`}>
              {feedback}
            </div>
          )}
          
          <div className="pt-bar-container">
            {/* Target Zone */}
            <div 
              className="pt-target" 
              style={{ 
                left: `${targetCenter - targetWidth/2}%`, 
                width: `${targetWidth}%` 
              }} 
            />
            
            {/* Moving Line */}
            <div 
              className="pt-line" 
              style={{ left: `${position}%` }} 
            />
          </div>
          
          {isPlaying && (
            <button className="btn-primary" style={{ marginTop: '40px', width: '200px' }} onClick={(e) => { e.stopPropagation(); handleTap(); }}>
              TAP!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
