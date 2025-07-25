import { useGameStore } from "../../store/gameStore";
import "./HomeScreen.css";

interface HomeScreenProps {
  onStartGame: () => void;
}

function HomeScreen({ onStartGame }: HomeScreenProps) {
  const { playerStats, startGame } = useGameStore();

  const handleStartClick = () => {
    startGame();
    onStartGame();
  };

  return (
    <div className="home-screen-overlay">
      <div className="home-screen-content">
        {/* Game Title */}
        <div className="game-title">
          <h1>WORMHOLE</h1>
          <h2>TUNNEL NAVIGATION</h2>
        </div>

        {/* Game Stats */}
        <div className="game-stats">
          <div className="stat-item">
            <span className="stat-label">High Score</span>
            <span className="stat-value">
              {playerStats.highScore.toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Games Played</span>
            <span className="stat-value">{playerStats.gamesPlayed}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="game-instructions">
          <p>Use arrow keys to navigate through the tunnel</p>
          <p>Avoid hitting the obstacles to survive</p>
        </div>

        {/* Start Button */}
        <button className="start-button" onClick={handleStartClick}>
          START GAME
        </button>

        {/* Controls Info */}
        <div className="controls-info">
          <div className="control-item">
            <span className="key">↑</span>
            <span className="action">Move Up</span>
          </div>
          <div className="control-item">
            <span className="key">↓</span>
            <span className="action">Move Down</span>
          </div>
          <div className="control-item">
            <span className="key">←</span>
            <span className="action">Move Left</span>
          </div>
          <div className="control-item">
            <span className="key">→</span>
            <span className="action">Move Right</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
