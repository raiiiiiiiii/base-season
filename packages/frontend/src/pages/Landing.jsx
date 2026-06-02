import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import abi from '../abi.json';
import './Landing.css';
import baseLogo from '../assets/base-logo.svg';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

export default function Landing() {
  const { data: currentSeason } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'currentSeason',
  });

  const seasonId = currentSeason ? Number(currentSeason) : 1;

  return (
    <div className="landing container animate-fade-in">
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

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value text-gradient">3</span>
            <span className="hero-stat-label">Mini Games</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value" style={{ color: 'var(--gold)' }}>#{seasonId}</span>
            <span className="hero-stat-label">Current Season</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value" style={{ color: 'var(--green)' }}>Live</span>
            <span className="hero-stat-label">Base Mainnet</span>
          </div>
        </div>
      </div>

      {/* ─── Right: Visual ─── */}
      <div className="hero-visual">
        {/* Ambient glow */}
        <div className="hero-orb" />

        {/* Center orb */}
        <div className="hero-orb-inner">🏆</div>

        {/* Floating stat cards */}
        <div className="glass-panel stat-card float-1">
          <span className="stat-card-label">Season</span>
          <span className="stat-card-value text-gradient">#{seasonId} Active</span>
        </div>

        <div className="glass-panel stat-card float-2">
          <span className="stat-card-label">Network</span>
          <span className="stat-card-value" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
            <img src={baseLogo} alt="Base" style={{ width: '20px', height: '20px' }} />
            Base Mainnet
          </span>
        </div>

        <div className="glass-panel stat-card float-3">
          <span className="stat-card-label">Top Prize</span>
          <span className="stat-card-value text-gradient-gold">Exclusive NFT</span>
        </div>
      </div>
    </div>
  );
}
