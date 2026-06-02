import React, { forwardRef } from 'react';
import { Trophy, Gamepad2, Flame, Zap, Award, Star, Crown, Compass } from 'lucide-react';
import './AchievementCard.css';

// Simple deterministic avatar generator based on address
const generateAvatar = (address) => {
  const seed = address ? address.toLowerCase().substring(2, 10) : '00000000';
  const color1 = `#${seed.substring(0, 6)}`;
  const color2 = `#${seed.substring(2, 8)}`;
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
    </defs>
    <rect width="80" height="80" fill="url(%23grad)" />
    <circle cx="40" cy="40" r="20" fill="rgba(255,255,255,0.2)" />
    <polygon points="40,15 60,60 20,60" fill="rgba(255,255,255,0.4)" />
  </svg>`;
};

const AchievementCard = forwardRef(({ 
  address, 
  ensName, 
  bestScore = 0, 
  gamesPlayed = 0, 
  currentStreak = 0,
  rank = 0,
  xpEarned = 0
}, ref) => {
  
  const formattedAddress = address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '0x000...0000';
  const displayName = ensName || formattedAddress;
  
  // Calculate some fun pseudo-badges based on stats if backend doesn't provide them
  const badges = [];
  if (bestScore > 500) badges.push({ id: 'top-scorer', name: 'Top Scorer', icon: Crown, color: '#FFD700' });
  else badges.push({ id: 'contender', name: 'Contender', icon: Star, color: '#C0C0C0' });
  
  if (gamesPlayed >= 10) badges.push({ id: 'daily-grinder', name: 'Daily Grinder', icon: Flame, color: '#FF4500' });
  else badges.push({ id: 'explorer', name: 'Season Explorer', icon: Compass, color: '#00C2FF' });
  
  badges.push({ id: 'early', name: 'Early Player', icon: Award, color: '#8A2BE2' });

  return (
    <div className="achievement-card-wrapper" ref={ref}>
      <div className="achievement-card">
        {/* Background glow effects */}
        <div className="card-bg-glow"></div>
        <div className="card-bg-glow-right"></div>
        <div className="card-grid-overlay"></div>

        {/* Header */}
        <div className="card-header">
          <div className="brand-section">
            <div className="achievement-logo-icon">
              <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="brand-text">
              <span className="brand-title">Base Seasons</span>
              <span className="season-badge">Season 1</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card-body">
          {/* Left: Player & Score */}
          <div className="player-score-section">
            <div className="player-info">
              <img src={generateAvatar(address)} alt="Avatar" className="player-avatar" />
              <div className="player-details">
                <span className="player-name">{displayName}</span>
                {ensName && <span className="player-address">{formattedAddress}</span>}
              </div>
            </div>

            <div className="score-display">
              <span className="score-label">Highest Score</span>
              <h1 className="score-value">{bestScore.toLocaleString()}</h1>
            </div>
          </div>

          {/* Right: Stats & Achievements */}
          <div className="stats-achievements-section">
            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-icon"><Trophy /></div>
                <div className="stat-info">
                  <span className="stat-label">Rank</span>
                  <span className="stat-value">{rank > 0 ? `#${rank.toLocaleString()}` : 'Unranked'}</span>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon"><Gamepad2 /></div>
                <div className="stat-info">
                  <span className="stat-label">Games Played</span>
                  <span className="stat-value">{gamesPlayed.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon"><Flame color="#FF4500" /></div>
                <div className="stat-info">
                  <span className="stat-label">Current Streak</span>
                  <span className="stat-value">{currentStreak}</span>
                </div>
              </div>
              
              <div className="stat-box">
                <div className="stat-icon"><Zap color="#00C2FF" /></div>
                <div className="stat-info">
                  <span className="stat-label">XP Earned</span>
                  <span className="stat-value">{xpEarned.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="achievements-row">
              {badges.slice(0, 3).map(badge => {
                const IconComponent = badge.icon;
                return (
                  <div key={badge.id} className="achievement-badge">
                    <div className="badge-icon" style={{ color: badge.color, borderColor: `${badge.color}40`, background: `${badge.color}15` }}>
                      <IconComponent />
                    </div>
                    <span className="badge-name">{badge.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer">
          <div className="footer-left">
            <span className="built-on">
              <span className="base-logo-small"></span> Built on Base
            </span>
          </div>
          <div className="footer-right">
            <span className="date-text">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span className="card-id">ID: {address ? address.substring(2, 10).toUpperCase() : 'UNKNOWN'}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

AchievementCard.displayName = 'AchievementCard';

export default AchievementCard;
