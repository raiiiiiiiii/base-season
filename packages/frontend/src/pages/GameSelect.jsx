import { Link } from 'react-router-dom';
import { useReadContracts } from 'wagmi';
import abi from '../abi.json';
import './GameSelect.css';

const CONTRACT_ADDRESS = "0x6Df4F452e77aF1879061F4F3728D5607B5082ce7";

const games = [
  {
    id: 'gas-dash',
    gameId: 1,
    title: 'Gas Dash',
    emoji: '⚡',
    description: 'Dodge obstacles and collect energy orbs. Speed increases every second — how long can you survive?',
    gradient: 'linear-gradient(135deg, #06B6D4, #0EA5E9)',
    color: '#06B6D4',
    difficulty: 2,
    difficultyText: 'Medium',
    estTime: '~2 mins'
  },
  {
    id: 'block-memory',
    gameId: 2,
    title: 'Block Memory',
    emoji: '🧠',
    description: 'Flip cards and match hidden pairs. Clear levels before the timer runs out to rack up bonus points.',
    gradient: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#2563EB',
    difficulty: 1,
    difficultyText: 'Easy',
    estTime: '~3 mins'
  },
  {
    id: 'precision-tap',
    gameId: 3,
    title: 'Precision Tap',
    emoji: '🎯',
    description: 'Stop the moving indicator inside the shrinking target zone. Pixel-perfect timing earns you perfects.',
    gradient: 'linear-gradient(135deg, #F43F5E, #EC4899)',
    color: '#F43F5E',
    difficulty: 3,
    difficultyText: 'Hard',
    estTime: '~1 min'
  }
];

export default function GameSelect() {
  const contractConfig = {
    address: CONTRACT_ADDRESS,
    abi,
  };

  const { data: statsData } = useReadContracts({
    contracts: [
      { ...contractConfig, functionName: 'gameHighestScores', args: [1] },
      { ...contractConfig, functionName: 'gameTotalPlays', args: [1] },
      { ...contractConfig, functionName: 'gameHighestScores', args: [2] },
      { ...contractConfig, functionName: 'gameTotalPlays', args: [2] },
      { ...contractConfig, functionName: 'gameHighestScores', args: [3] },
      { ...contractConfig, functionName: 'gameTotalPlays', args: [3] },
    ],
  });

  const getStatsForGame = (gameId) => {
    if (!statsData) return { highestScore: 0, totalPlays: 0 };
    const baseIndex = (gameId - 1) * 2;
    return {
      highestScore: statsData[baseIndex]?.result ? Number(statsData[baseIndex].result) : 0,
      totalPlays: statsData[baseIndex + 1]?.result ? Number(statsData[baseIndex + 1].result) : 0,
    };
  };

  return (
    <div className="game-select container animate-fade-in">
      <div className="header-section">
        <h2>Choose Your <span className="text-gradient">Game</span></h2>
        <p className="text-secondary">Master mini-games to earn onchain points for the season.</p>
      </div>

      <div className="game-grid stagger">
        {games.map((game) => {
          const stats = getStatsForGame(game.gameId);
          return (
            <div key={game.id} className="glass-panel game-card animate-fade-up">
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

                {/* Game Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>High Score</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-1)' }}>{stats.highestScore}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-3)', textTransform: 'uppercase' }}>Total Plays</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-1)' }}>{stats.totalPlays}</div>
                  </div>
                </div>

                {/* Difficulty & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', fontWeight: '500' }}>
                    🕒 {game.estTime}
                  </div>
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
          );
        })}
      </div>
    </div>
  );
}
