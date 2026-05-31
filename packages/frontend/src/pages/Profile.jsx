import React, { useRef } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import html2canvas from 'html2canvas';
import abi from '../abi.json';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const cardRef = useRef(null);
  
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
            <div ref={cardRef} style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: '16px', display: 'inline-block', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}><span className="text-gradient">Base Seasons</span></h2>
              <p>Player: {address.slice(0,6)}...{address.slice(-4)}</p>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0' }}>Score: {Number(stats.bestScore)}</p>
              <p style={{ color: '#00C2FF' }}>Onchain Legacy</p>
            </div>
            <div>
              <button className="btn-primary" onClick={async () => {
                if (cardRef.current) {
                  const canvas = await html2canvas(cardRef.current, { backgroundColor: '#0a0a0a' });
                  const url = canvas.toDataURL('image/png');
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'base-seasons-score.png';
                  a.click();
                }
              }}>Download Score Card</button>
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
