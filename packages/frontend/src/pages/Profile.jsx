import React, { useRef } from 'react';
import { useAccount, useReadContract, useEnsName } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import html2canvas from 'html2canvas';
import abi from '../abi.json';
import AchievementCard from '../components/AchievementCard';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const cardRef = useRef(null);
  const { data: ensName } = useEnsName({ address });
  
  const { data: statsRaw, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
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
  } : null;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2>Player Profile</h2>
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
        <div className="glass-panel" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
          Loading your stats from Base...
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '800px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '10px' }}>Total Score</h3>
            <p className="text-gradient" style={{ fontSize: '3rem', fontWeight: 'bold' }}>{Number(stats.totalScore)}</p>
          </div>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '10px' }}>Best Score</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{Number(stats.bestScore)}</p>
          </div>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '10px' }}>Games Played</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{Number(stats.gamesPlayed)}</p>
          </div>
          <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '10px' }}>Current Streak</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffcc00' }}>🔥 {Number(stats.currentStreak)}</p>
          </div>
          
          <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', marginTop: '20px' }}>
            <div style={{ marginBottom: '30px' }}>
              <AchievementCard 
                ref={cardRef}
                address={address}
                ensName={ensName}
                bestScore={Number(stats.bestScore || 0)}
                gamesPlayed={Number(stats.gamesPlayed || 0)}
                currentStreak={Number(stats.currentStreak || 0)}
                rank={Math.floor(Math.random() * 100) + 1} // Mock rank for display
                xpEarned={Number(stats.totalScore || 0) * 10} // Mock XP derived from score
              />
            </div>
            <div>
              <button className="btn-primary" onClick={async () => {
                if (cardRef.current) {
                  // Capture at exactly 1200x675 for X (Twitter)
                  const canvas = await html2canvas(cardRef.current, { 
                    backgroundColor: '#0a0b10',
                    scale: 1,
                    width: 1200,
                    height: 675,
                    useCORS: true,
                    onclone: (doc) => {
                      const el = doc.querySelector('.achievement-card-wrapper');
                      if (el) {
                        el.style.width = '1200px';
                        el.style.maxWidth = '1200px';
                        el.style.height = '675px';
                        el.style.margin = '0';
                        el.style.transform = 'none';
                      }
                    }
                  });
                  const url = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `base-seasons-${address.slice(0,6)}.png`;
                  a.click();
                }
              }}>Download 1200x675 For X</button>
            </div>
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
