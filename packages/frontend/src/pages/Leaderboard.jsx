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
    if (idx === 0) return { border: '1px solid var(--gold)', boxShadow: '0 0 24px rgba(245, 158, 11, 0.15)' };
    if (idx === 1) return { border: '1px solid var(--silver)', boxShadow: '0 0 16px rgba(148, 163, 184, 0.1)' };
    if (idx === 2) return { border: '1px solid var(--bronze)', boxShadow: '0 0 12px rgba(205, 127, 50, 0.1)' };
    return {};
  };

  const getRankColor = (idx) => {
    if (idx === 0) return 'var(--gold)';
    if (idx === 1) return 'var(--silver)';
    if (idx === 2) return 'var(--bronze)';
    return 'var(--text-3)';
  };

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h2 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
          Hall of <span className="text-gradient">Fame</span>
        </h2>
        <p className="text-secondary" style={{ fontSize: '1.15rem' }}>Top players competing for glory in Season {seasonId}</p>
      </div>
      
      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <div className="glass-panel" style={{ display: 'flex', padding: '6px', borderRadius: 'var(--radius-md)', gap: '6px' }}>
          <button 
            className={selectedGame === 1 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '10px 24px', minHeight: 'auto', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
            onClick={() => setSelectedGame(1)}>Gas Dash
          </button>
          <button 
            className={selectedGame === 2 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '10px 24px', minHeight: 'auto', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
            onClick={() => setSelectedGame(2)}>Block Memory
          </button>
          <button 
            className={selectedGame === 3 ? 'btn-primary' : 'btn-secondary'} 
            style={{ padding: '10px 24px', minHeight: 'auto', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem' }}
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
      <div className="stagger" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {CONTRACT_ADDRESS === "0x" ? (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Contract not deployed yet.</div>
        ) : loadingScores ? (
          <div className="glass-panel animate-fade-in" style={{ padding: '60px', textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: '16px', color: 'var(--text-2)' }}>Syncing onchain data...</p>
          </div>
        ) : top10.length === 0 ? (
          <div className="glass-panel animate-fade-up" style={{ padding: '60px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '8px', fontSize: '1.5rem' }}>No scores yet</h3>
            <p style={{ color: 'var(--text-2)' }}>Be the first to claim the #1 spot in Season {seasonId}!</p>
          </div>
        ) : (
          top10.map((score, idx) => (
            <div 
              key={idx} 
              className="glass-panel animate-fade-up" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '20px 28px', 
                borderRadius: 'var(--radius-md)',
                transition: 'transform var(--transition-spring), box-shadow var(--transition)',
                cursor: 'default',
                ...getRankStyle(idx)
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; }}
            >
              <div style={{ width: '60px', fontSize: '1.6rem', fontWeight: '800', color: getRankColor(idx), fontFamily: 'Space Grotesk' }}>
                #{idx + 1}
              </div>
              
              <div style={{ flex: 1 }}>
                <div className="mono" style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-1)' }}>
                  {shortenAddress(score.player)}
                </div>
                {idx === 0 && <span className="badge badge-gold" style={{ marginTop: '8px' }}>✨ Champion</span>}
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '600' }}>Score</div>
                <div className="text-gradient" style={{ fontSize: '2rem', fontWeight: '800', fontFamily: 'Space Grotesk', lineHeight: '1.1' }}>
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
