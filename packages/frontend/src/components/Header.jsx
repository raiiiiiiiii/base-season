import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import './Header.css';

import baseLogo from '../assets/base-logo.svg';

export default function Header() {
  return (
    <header className="header glass-panel">
      <div className="header-container">
        <Link to="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src={baseLogo} alt="Base" style={{ width: '32px', height: '32px' }} />
          <span className="text-gradient">Base Seasons</span>
        </Link>
        <nav className="nav-links">
          <Link to="/games">Games</Link>
          <Link to="/leaderboard">Leaderboard</Link>
          <Link to="/profile">Profile</Link>
        </nav>
        <ConnectButton />
      </div>
    </header>
  );
}
