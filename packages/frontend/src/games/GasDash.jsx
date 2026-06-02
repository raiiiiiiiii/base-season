import React, { useState, useEffect, useRef } from 'react';
import ScoreSubmit from '../components/ScoreSubmit';

export default function GasDash() {
  const canvasRef = useRef(null);
  const scoreRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Game Constants
  const GAME_ID = 1; // 1 for Gas Dash
  
  const startGame = () => {
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  };
  
  useEffect(() => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let animationFrameId;
    let currentScore = 0;
    
    const player = {
      lane: 1, // 0: left, 1: center, 2: right
      y: canvas.height - 100,
      width: 40,
      height: 60,
      color: '#06B6D4' // var(--cyan)
    };
    
    const lanes = [
      canvas.width / 6, 
      canvas.width / 2, 
      (canvas.width / 6) * 5
    ];
    
    // Obstacles and Energy
    let obstacles = [];
    let energies = [];
    let gameSpeed = 5;
    let frameCount = 0;
    
    const spawnItems = () => {
      frameCount++;
      
      // Increase speed slightly
      if (frameCount % 600 === 0) gameSpeed += 0.5;
      
      if (frameCount % Math.max(30, Math.floor(100 - gameSpeed * 2)) === 0) {
        const lane = Math.floor(Math.random() * 3);
        obstacles.push({
          lane,
          y: -50,
          width: 50,
          height: 50,
          color: '#F43F5E' // var(--red)
        });
      }
      
      if (frameCount % 80 === 0 && Math.random() > 0.3) {
        const lane = Math.floor(Math.random() * 3);
        energies.push({
          lane,
          y: -30,
          radius: 15,
          color: '#8B5CF6' // var(--violet)
        });
      }
    };
    
    const update = () => {
      spawnItems();
      currentScore += 1; // Distance points
      
      // Update obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += gameSpeed;
        
        // Collision check
        if (
          player.lane === obs.lane &&
          player.y < obs.y + obs.height &&
          player.y + player.height > obs.y
        ) {
          setIsPlaying(false);
          setGameOver(true);
          setScore(Math.floor(currentScore / 10)); // Scale score down a bit
          return; // Stop game loop
        }
        
        if (obs.y > canvas.height) obstacles.splice(i, 1);
      }
      
      // Update energies
      for (let i = energies.length - 1; i >= 0; i--) {
        const energy = energies[i];
        energy.y += gameSpeed;
        
        // Collision
        if (
          player.lane === energy.lane &&
          player.y < energy.y + energy.radius * 2 &&
          player.y + player.height > energy.y - energy.radius * 2
        ) {
          currentScore += 500; // Bonus points
          energies.splice(i, 1);
        } else if (energy.y > canvas.height) {
          energies.splice(i, 1);
        }
      }
    };
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw lanes
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 3, 0);
      ctx.lineTo(canvas.width / 3, canvas.height);
      ctx.moveTo((canvas.width / 3) * 2, 0);
      ctx.lineTo((canvas.width / 3) * 2, canvas.height);
      ctx.stroke();
      
      // Draw Player
      ctx.fillStyle = player.color;
      ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
      ctx.shadowBlur = 20;
      // Add neon core effect
      ctx.fillRect(lanes[player.lane] - player.width / 2, player.y, player.width, player.height);
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 0;
      ctx.fillRect(lanes[player.lane] - player.width / 4, player.y + 10, player.width / 2, player.height - 20);
      
      // Draw obstacles
      ctx.fillStyle = '#F43F5E';
      ctx.shadowColor = 'rgba(244, 63, 94, 0.8)';
      ctx.shadowBlur = 20;
      obstacles.forEach(obs => {
        ctx.fillRect(lanes[obs.lane] - obs.width / 2, obs.y, obs.width, obs.height);
      });
      
      // Draw energies
      ctx.fillStyle = '#8B5CF6';
      ctx.shadowColor = 'rgba(139, 92, 246, 0.8)';
      ctx.shadowBlur = 25;
      energies.forEach(en => {
        ctx.beginPath();
        ctx.arc(lanes[en.lane], en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
        // Inner white core
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(lanes[en.lane], en.y, en.radius / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8B5CF6';
        ctx.shadowBlur = 25;
      });
      ctx.shadowBlur = 0;
      
      // Draw score HTML instead
      if (scoreRef.current) {
        scoreRef.current.textContent = Math.floor(currentScore / 10);
      }
    };
    
    let lastTime = 0;
    let accumulator = 0;
    const TIME_STEP = 1000 / 60; // 60 updates per second
    
    const loop = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const dt = timestamp - lastTime;
      lastTime = timestamp;
      accumulator += dt;
      
      while (accumulator >= TIME_STEP && isPlaying) {
        update();
        accumulator -= TIME_STEP;
      }
      
      draw();
      if (isPlaying) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };
    
    animationFrameId = requestAnimationFrame(loop);
    
    // Controls
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && player.lane > 0) player.lane--;
      if (e.key === 'ArrowRight' && player.lane < 2) player.lane++;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '16px', letterSpacing: '-0.03em' }}>Gas <span className="text-gradient">Dash</span></h2>
        <p className="text-secondary" style={{ fontSize: '1.15rem' }}>Use Left/Right arrows to dodge and collect energy</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {!isPlaying && !gameOver && (
          <div className="glass-panel" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10, padding: '48px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '2rem', marginBottom: '8px' }}>Ready to run?</h3>
            <p className="text-secondary" style={{ marginBottom: '24px' }}>Survive as long as you can.</p>
            <button className="btn-primary" onClick={startGame}>Start Game</button>
          </div>
        )}
        
        {gameOver && (
          <div style={{ position: 'absolute', top: '10%', zIndex: 10, width: '100%' }}>
            <ScoreSubmit gameId={1} score={score} onRestart={startGame} />
          </div>
        )}
        
        <div style={{ position: 'relative', opacity: gameOver ? 0.3 : 1, transition: 'opacity 0.4s ease' }}>
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={600} 
            className="glass-panel"
            style={{ background: 'var(--bg-darker)', borderRadius: 'var(--radius-xl)', display: 'block', boxShadow: 'var(--shadow-lg), inset 0 0 60px rgba(0,0,0,0.8)' }}
          />
          {isPlaying && !gameOver && (
            <div className="game-hud glass-panel" style={{ position: 'absolute', top: '20px', left: '20px', padding: '16px 24px', borderRadius: 'var(--radius-md)', background: 'rgba(13, 14, 28, 0.7)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700' }}>Score</span>
              <div ref={scoreRef} className="text-gradient" style={{ fontSize: '2rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>0</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
