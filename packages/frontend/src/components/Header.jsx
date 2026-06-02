import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect, useState } from 'react';
import './Header.css';
import baseLogo from '../assets/base-logo.svg';

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">
            <img src={baseLogo} alt="Base" style={{ width: '22px', height: '22px' }} />
          </div>
          <span className="text-gradient">Base Seasons</span>
        </Link>

        <nav className="nav-links">
          <Link to="/games" className={isActive('/games')}>Games</Link>
          <Link to="/leaderboard" className={isActive('/leaderboard')}>Leaderboard</Link>
          <Link to="/profile" className={isActive('/profile')}>Profile</Link>
        </nav>

        <div className="header-connect">
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
