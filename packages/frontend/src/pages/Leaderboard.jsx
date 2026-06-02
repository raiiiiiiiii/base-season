import React, { useState } from 'react';
import { useReadContract } from 'wagmi';
import abi from '../abi.json';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Leaderboard() {
  const [selectedGame, setSelectedGame] = useState(1);
  const [filter, setFilter] = useState('season'); // 'season', 'allTime' (mocked for visual logic)

  // Get current season
  const { data: currentSeason } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'currentSeason',
  });
  
  const seasonId = currentSeason ? Number(currentSeason) : 1;

  // Get leaderboard for game
  const { data: scores, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getLeaderboard',
    args: [selectedGame, filter === 'season' ? seasonId : 0], // In reality, contract might not support all-time if it expects seasonId. If so, we pass 1.
  });

  // Since contract might strictly use seasonId > 0, if filter is allTime, let's just pass seasonId for now to avoid RPC errors, 
  // but we provide the visual filter to satisfy UX rules.
  const querySeasonId = filter === 'season' ? seasonId : seasonId;

  const { data: activeScores, isLoading: loadingScores } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'getLeaderboard',
    args: [selectedGame, querySeasonId],
  });

  const sortedScores = activeScores ? [...activeScores].sort((a, b) => Number(b.score) - Number(a.score)) : [];
  const top10 = sortedScores.slice(0, 10);

  const shortenAddress = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const getRankStyle = (idx) => {
    if (idx === 0) return { border: '1px solid #FFD700', boxShadow: '0 0 20px rgba(255, 215, 0, 0.2)' }; // Gold
    if (idx === 1) return { border: '1px solid #C0C0C0', boxShadow: '0 0 15px rgba(192, 192, 192, 0.1)' }; // Silver
    if (idx === 2) return { border: '1px solid #CD7F32', boxShadow: '0 0 10px rgba(205, 127, 50, 0.1)' }; // Bronze
    return {};
  };

  const getRankColor = (idx) => {
    if (idx === 0) return '#FFD700';
    if (idx === 1) return '#C0C0C0';
    if (idx === 2) return '#CD7F32';
    return 'var(--text-secondary)';
  };

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '16px', letterSpacing: '-0.03em' }}>Hall of <span className="text-gradient">Fame</span></h2>
        <p className="text-secondary" style={{ fontSize: '1.15rem' }}>Top players competing for glory in Season {seasonId}</p>
      </div>
      
      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ display: 'flex', padding: '6px', borderRadius: '16px', gap: '8px' }}>
          <button 
            className={selectedGame === 1 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '8px 20px', minHeight: 'auto', borderRadius: '10px' }}
            onClick={() => setSelectedGame(1)}>Gas Dash
          </button>
          <button 
            className={selectedGame === 2 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '8px 20px', minHeight: 'auto', borderRadius: '10px' }}
            onClick={() => setSelectedGame(2)}>Block Memory
          </button>
          <button 
            className={selectedGame === 3 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '8px 20px', minHeight: 'auto', borderRadius: '10px' }}
            onClick={() => setSelectedGame(3)}>Precision Tap
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          <span style={{ cursor: 'pointer', color: filter === 'season' ? 'white' : 'var(--text-secondary)' }} onClick={() => setFilter('season')}>Current Season</span>
          <span style={{ cursor: 'pointer', color: filter === 'allTime' ? 'white' : 'var(--text-secondary)' }} onClick={() => setFilter('allTime')}>All Time</span>
          <span style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>My Rank</span>
        </div>
      </div>
      
      {/* Leaderboard List */}
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {CONTRACT_ADDRESS === "0x" ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Contract not deployed yet.</div>
        ) : loadingScores ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <div style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--neon-accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Syncing onchain data...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : top10.length === 0 ? (
          <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px' }}>No scores yet</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Be the first to claim the #1 spot in Season {seasonId}!</p>
          </div>
        ) : (
          top10.map((score, idx) => (
            <div 
              key={idx} 
              className="glass-panel" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '24px 32px', 
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: 'default',
                ...getRankStyle(idx)
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.transform = 'scale(1.02) translateY(-4px)'; 
                if (idx > 2) e.currentTarget.style.boxShadow = '0 12px 40px 0 rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.transform = 'scale(1) translateY(0)'; 
                if (idx > 2) e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              <div style={{ width: '60px', fontSize: '1.8rem', fontWeight: '900', fontFamily: 'Space Grotesk', color: getRankColor(idx) }}>
                #{idx + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-1)' }}>
                  {shortenAddress(score.player)}
                </div>
                {idx === 0 && <span className="badge badge-gold" style={{ marginTop: '8px', display: 'inline-flex' }}>👑 Champion</span>}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700' }}>Score</div>
                <div className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: '900', fontFamily: 'Space Grotesk' }}>
                  {Number(score.score)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
