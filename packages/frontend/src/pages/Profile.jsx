import React, { useRef } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import html2canvas from 'html2canvas';
import abi from '../abi.json';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const cardRef = useRef(null);

  const contractConfig = {
    address: CONTRACT_ADDRESS,
    abi,
  };
  
  // Need to get season to fetch leaderboard for rank calculation
  const { data: currentSeason } = useReadContract({
    ...contractConfig,
    functionName: 'currentSeason',
  });
  const seasonId = currentSeason ? Number(currentSeason) : 1;

  // We assume game 1 (Gas Dash) is the main leaderboard or we calculate across games
  // For simplicity and since we don't have a cross-game leaderboard function in the contract, 
  // we'll calculate rank based on Game 1 for now or check if they are in the leaderboard.
  // A perfect solution would need an indexer.
  const { data: leaderboardData } = useReadContract({
    ...contractConfig,
    functionName: 'getLeaderboard',
    args: [1, seasonId], // game 1, current season
  });

  const { data: statsRaw, isLoading } = useReadContract({
    ...contractConfig,
    functionName: 'players',
    args: [address],
    query: {
      enabled: isConnected && !!address,
    }
  });

  const stats = statsRaw ? {
    totalScore: statsRaw[0],
    bestScore: statsRaw[1],
    gamesPlayed: statsRaw[2],
    lastPlayed: statsRaw[3],
    joinDate: statsRaw[4], // New field we added to the smart contract
  } : null;

  // Calculate current rank from leaderboard
  let currentRank = "Unranked";
  if (leaderboardData && address) {
    const sortedScores = [...leaderboardData].sort((a, b) => Number(b.score) - Number(a.score));
    const index = sortedScores.findIndex(s => s.player.toLowerCase() === address.toLowerCase());
    if (index !== -1) {
      currentRank = `#${index + 1}`;
    }
  }

  // Format join date
  const formattedJoinDate = stats && stats.joinDate && Number(stats.joinDate) > 0 
    ? new Date(Number(stats.joinDate) * 1000).toLocaleDateString()
    : "N/A";

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>Player <span className="text-gradient">Profile</span></h2>
        <p className="text-secondary">Your onchain legacy</p>
      </div>
      
      {!isConnected ? (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <p>Connect wallet to view your profile and stats.</p>
          <ConnectButton />
        </div>
      ) : CONTRACT_ADDRESS === "0x" ? (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          Contract not deployed yet.
        </div>
      ) : isLoading ? (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '60px', textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          Loading your stats from Base...
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Wallet Address</div>
                <div className="mono" style={{ fontSize: '1.2rem', color: 'var(--text-1)' }}>{address}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--text-3)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Member Since</div>
                <div style={{ fontSize: '1.2rem', color: 'var(--text-1)', fontWeight: 'bold' }}>{formattedJoinDate}</div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Current Rank</h3>
            <p className="text-gradient-gold" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{currentRank}</p>
          </div>
          
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Highest Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Number(stats.bestScore)}</p>
          </div>

          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Games Played</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Number(stats.gamesPlayed)}</p>
          </div>

          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Points</h3>
            <p className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Number(stats.totalScore)}</p>
          </div>
          
          {/* Share Card functionality removed in favor of the specialized ScoreSubmit card, or kept here as an ID */}
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: 'var(--text-2)', marginBottom: '16px' }}>Play a game to generate your premium Base Seasons ID Card.</p>
            <button className="btn-primary" onClick={() => window.location.href = '/games'}>
              Go to Arcade
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          Play a game to initialize your profile!
        </div>
      )}
    </div>
  );
}
