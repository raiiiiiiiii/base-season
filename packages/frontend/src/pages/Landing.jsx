import { Link } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import abi from '../abi.json';
import './Landing.css';

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
      <div className="hero-content">
        <h1 className="hero-title">
          Compete. Rank. <br />
          <span className="text-gradient">Own your onchain legacy.</span>
        </h1>
        <p className="hero-subtitle">
          Base Seasons is a premium Web3 arcade. Play skill-based mini-games, submit your high scores on Base Mainnet, and climb the seasonal leaderboards to earn your rank.
        </p>
        <div className="hero-actions">
          <Link to="/games" className="btn-primary glow-hover">Play Now</Link>
          <Link to="/leaderboard" className="btn-secondary">View Leaderboard</Link>
        </div>
      </div>
      
      <div className="hero-visual">
        <div className="glass-panel stat-card float-1">
          <h3>Season {seasonId}</h3>
          <p className="text-gradient">Active Now</p>
        </div>
        <div className="glass-panel stat-card float-2">
          <h3>Top Prize</h3>
          <p className="text-gradient">Exclusive NFT</p>
        </div>
        <div className="glass-panel stat-card float-3">
          <h3>Network</h3>
          <p style={{ color: '#0052FF' }}>Base Mainnet</p>
        </div>
      </div>
    </div>
  );
}
