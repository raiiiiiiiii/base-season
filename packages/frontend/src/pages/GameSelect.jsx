import { Link } from 'react-router-dom';
import './GameSelect.css';

const games = [
  {
    id: 'gas-dash',
    title: 'Gas Dash',
    description: 'Dodge obstacles and collect energy. Speed increases over time!',
    color: '#00C2FF'
  },
  {
    id: 'block-memory',
    title: 'Block Memory',
    description: 'Flip cards and remember patterns. Difficulty scales up each round.',
    color: '#0052FF'
  },
  {
    id: 'precision-tap',
    title: 'Precision Tap',
    description: 'Stop the moving bar exactly in the target zone. Timing is everything.',
    color: '#ff3366'
  }
];

export default function GameSelect() {
  return (
    <div className="game-select container animate-fade-in">
      <div className="header-section">
        <h2>Select a Game</h2>
        <p className="text-secondary">Play mini-games to earn points for the current season.</p>
      </div>
      
      <div className="game-grid">
        {games.map(game => (
          <div key={game.id} className="glass-panel game-card">
            <div className="game-icon" style={{ background: `linear-gradient(135deg, ${game.color}40 0%, transparent 100%)`, border: `1px solid ${game.color}80` }}>
              {/* Placeholder icon */}
            </div>
            <h3>{game.title}</h3>
            <p>{game.description}</p>
            <Link to={`/games/${game.id}`} className="btn-primary play-btn" style={{ background: game.color }}>
              Play Now
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
