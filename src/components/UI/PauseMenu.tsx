import { useGameStore } from "../../store/gameStore";
import "./PauseMenu.css";

function PauseMenu() {
  const { gameState, resumeGame, resetGame, playerStats } = useGameStore();

  if (gameState !== "paused") return null;

  return (
    <div className="pause-menu-overlay">
      <div className="pause-menu-content">
        <h1 className="pause-title">GAME PAUSED</h1>

        <div className="pause-stats">
          <div className="stat-item">
            <span className="stat-label">Current Score</span>
            <span className="stat-value">
              {playerStats.score.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="pause-buttons">
          <button className="resume-button" onClick={resumeGame}>
            RESUME GAME
          </button>
          <button className="quit-button" onClick={resetGame}>
            QUIT TO MENU
          </button>
        </div>

        <div className="pause-controls">
          <p>
            Press <span className="key">ESC</span> to resume
          </p>
          <p>
            Press <span className="key">SPACE</span> to resume
          </p>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
