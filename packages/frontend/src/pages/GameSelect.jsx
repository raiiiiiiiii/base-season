import { Link } from 'react-router-dom';
import './GameSelect.css';

const games = [
  {
    id: 'gas-dash',
    title: 'Gas Dash',
    emoji: '⚡',
    description: 'Dodge obstacles and collect energy orbs. Speed increases every second — how long can you survive?',
    gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
    color: '#06B6D4',
    difficulty: 2,
    difficultyText: 'Medium',
  },
  {
    id: 'block-memory',
    title: 'Block Memory',
    emoji: '🧠',
    description: 'Flip cards and match hidden pairs. Clear levels before the timer runs out to rack up bonus points.',
    gradient: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#2563EB',
    difficulty: 1,
    difficultyText: 'Easy',
  },
  {
    id: 'precision-tap',
    title: 'Precision Tap',
    emoji: '🎯',
    description: 'Stop the moving indicator inside the shrinking target zone. Pixel-perfect timing earns you perfects.',
    gradient: 'linear-gradient(135deg, #F43F5E, #EC4899)',
    color: '#F43F5E',
    difficulty: 3,
    difficultyText: 'Hard',
  }
];

export default function GameSelect() {
  return (
    <div className="game-select container animate-fade-in">
      <div className="header-section">
        <h2>Choose Your <span className="text-gradient">Game</span></h2>
        <p className="text-secondary">Master mini-games to earn onchain points for the season.</p>
      </div>

      <div className="game-grid stagger">
        {games.map(game => (
          <div key={game.id} className="glass-panel game-card animate-fade-up" style={{ opacity: 0 }}>
            {/* Top accent */}
            <div className="game-card-accent" style={{ background: game.gradient }} />

            <div className="game-card-body">
              {/* Icon */}
              <div
                className="game-icon-wrap"
                style={{
                  background: `${game.color}15`,
                  border: `1px solid ${game.color}40`,
                }}
              >
                {game.emoji}
              </div>

              <h3 className="game-card-title">{game.title}</h3>
              <p className="game-card-desc">{game.description}</p>

              {/* Difficulty */}
              <div className="game-difficulty">
                {[1, 2, 3].map(d => (
                  <div
                    key={d}
                    className={`difficulty-dot ${d <= game.difficulty ? 'active' : ''}`}
                    style={{ color: game.color, background: game.color }}
                  />
                ))}
                <span className="difficulty-label">{game.difficultyText}</span>
              </div>

              <Link
                to={`/games/${game.id}`}
                className="btn-primary play-btn"
                style={{ background: game.gradient }}
              >
                Play Now
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
