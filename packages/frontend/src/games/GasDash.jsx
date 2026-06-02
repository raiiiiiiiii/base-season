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
    
    // Player state
    const player = {
      lane: 1, // 0: left, 1: center, 2: right
      y: canvas.height - 100,
      width: 40,
      height: 60,
      color: '#00C2FF'
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
      
      // Spawn obstacle
      if (frameCount % Math.max(30, Math.floor(100 - gameSpeed * 2)) === 0) {
        const lane = Math.floor(Math.random() * 3);
        obstacles.push({
          lane,
          y: -50,
          width: 50,
          height: 50,
          color: '#ff3366'
        });
      }
      
      // Spawn energy
      if (frameCount % 80 === 0 && Math.random() > 0.3) {
        const lane = Math.floor(Math.random() * 3);
        energies.push({
          lane,
          y: -30,
          radius: 15,
          color: '#0052FF'
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
      ctx.shadowColor = player.color;
      ctx.shadowBlur = 10;
      ctx.fillRect(lanes[player.lane] - player.width / 2, player.y, player.width, player.height);
      ctx.shadowBlur = 0; // reset
      
      // Draw obstacles
      ctx.fillStyle = '#ff3366';
      obstacles.forEach(obs => {
        ctx.fillRect(lanes[obs.lane] - obs.width / 2, obs.y, obs.width, obs.height);
      });
      
      // Draw energies
      ctx.fillStyle = '#0052FF';
      ctx.shadowColor = '#0052FF';
      ctx.shadowBlur = 15;
      energies.forEach(en => {
        ctx.beginPath();
        ctx.arc(lanes[en.lane], en.y, en.radius, 0, Math.PI * 2);
        ctx.fill();
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
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Gas Dash</h2>
        <p className="text-secondary">Use Left/Right arrows to dodge and collect energy</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        {!isPlaying && !gameOver && (
          <div className="glass-panel" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10, padding: '40px', textAlign: 'center' }}>
            <h3>Ready to run?</h3>
            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={startGame}>Start Game</button>
          </div>
        )}
        
        {gameOver && (
          <div style={{ position: 'absolute', top: '20%', zIndex: 10, width: '100%' }}>
            <ScoreSubmit gameId={1} score={score} onRestart={startGame} />
          </div>
        )}
        
        <div style={{ position: 'relative' }}>
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={600} 
            className="glass-panel"
            style={{ background: '#050505', borderRadius: '16px', display: 'block' }}
          />
          {isPlaying && !gameOver && (
            <div className="game-hud glass-panel" style={{ position: 'absolute', top: '15px', left: '15px', padding: '10px 20px', borderRadius: '12px', background: 'rgba(10, 10, 15, 0.5)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              <div ref={scoreRef} className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Space Grotesk' }}>0</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
