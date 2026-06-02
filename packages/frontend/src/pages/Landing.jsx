import { Link } from 'react-router-dom';
import { useReadContracts, useReadContract } from 'wagmi';
import { useState, useEffect } from 'react';
import abi from '../abi.json';
import './Landing.css';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Landing() {
  const [timeLeft, setTimeLeft] = useState('');

  const contractConfig = {
    address: CONTRACT_ADDRESS,
    abi,
  };

  const { data: statsData } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: 'currentSeason' },
      { ...contractConfig, functionName: 'seasonStartTime' },
      { ...contractConfig, functionName: 'SEASON_DURATION' },
      { ...contractConfig, functionName: 'globalTotalPlayers' },
      { ...contractConfig, functionName: 'globalHighestScore' },
      { ...contractConfig, functionName: 'globalGamesPlayed' },
    ],
  });

  const seasonId = statsData?.[0]?.result ? Number(statsData[0].result) : 1;
  const startTime = statsData?.[1]?.result ? Number(statsData[1].result) : 0;
  const duration = statsData?.[2]?.result ? Number(statsData[2].result) : 604800; // 7 days fallback
  
  const totalPlayers = statsData?.[3]?.result ? Number(statsData[3].result) : 0;
  const highestScore = statsData?.[4]?.result ? Number(statsData[4].result) : 0;
  const gamesPlayed = statsData?.[5]?.result ? Number(statsData[5].result) : 0;

  useEffect(() => {
    if (!startTime) return;
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = startTime + duration;
      const diff = endTime - now;
      
      if (diff <= 0) {
        setTimeLeft('Season Ended');
      } else {
        const days = Math.floor(diff / (60 * 60 * 24));
        const hours = Math.floor((diff % (60 * 60 * 24)) / (60 * 60));
        const mins = Math.floor((diff % (60 * 60)) / 60);
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, duration]);

  return (
    <div className="landing-wrapper animate-fade-in" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div className="landing container" style={{ flex: 1 }}>
        {/* ─── Left: Hero Content ─── */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            🔵 Season {seasonId} — Live on Base
          </div>

          <h1 className="hero-title">
            <span className="block">Play. Compete.</span>
            <span className="text-gradient block">Own your legacy.</span>
          </h1>

          <p className="hero-subtitle">
            Base Seasons is a premium onchain arcade. Master skill-based mini-games,
            submit your scores to Base Mainnet, and climb the leaderboard to claim your rank.
          </p>

          <div className="hero-actions">
            <Link to="/games" className="btn-primary glow-hover">
              🎮 Play Now
            </Link>
            <Link to="/leaderboard" className="btn-secondary">
              View Leaderboard →
            </Link>
          </div>

          <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '32px' }}>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Players</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-1)' }}>{totalPlayers}</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Highest Score</div>
              <div className="text-gradient-gold" style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{highestScore}</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px' }}>
              <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Games Played</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-1)' }}>{gamesPlayed}</div>
            </div>
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 194, 255, 0.2)' }}>
              <div style={{ color: 'var(--text-3)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Season {seasonId} Ends In</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--cyan)', marginTop: '8px' }}>{timeLeft || 'Calculating...'}</div>
            </div>
          </div>
        </div>

        {/* ─── Right: Visual ─── */}
        <div className="hero-visual" style={{ position: 'relative' }}>
          {/* Ambient glow */}
          <div className="hero-orb" />

          {/* Center orb */}
          <div className="hero-orb-inner">🏆</div>
          
          <div className="glass-panel stat-card float-2" style={{ position: 'absolute', bottom: '10%', right: '0', zIndex: 2 }}>
            <span className="stat-card-label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-3)', marginBottom: '4px' }}>Season Rewards</span>
            <span className="stat-card-value text-gradient" style={{ display: 'block', fontWeight: 'bold' }}>Champion Badge & Glory</span>
          </div>
        </div>
      </div>
      
      {/* ─── How It Works Section ─── */}
      <section className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '48px' }}>How It <span className="text-gradient">Works</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>1️⃣</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Connect Wallet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Securely connect your Base-compatible wallet.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎮</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Play Mini-Games</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Master skill-based arcade games to rack up points.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✍️</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Submit Score</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Sign a message to permanently record your score onchain.</p>
          </div>
          <div className="glass-panel" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🏆</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Compete</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Climb the leaderboard and cement your legacy.</p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '32px 20px', textAlign: 'center', marginTop: 'auto' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Built on Base. Not affiliated with Coinbase.
        </div>
      </footer>
    </div>
  );
}
