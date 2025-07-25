import { useGameStore } from "../../store/gameStore";
import "./GameOverScreen.css";

function GameOverScreen() {
  const { gameState, playerStats, resetGame, quitGame } = useGameStore();

  if (gameState !== "gameOver") return null;

  const isNewHighScore =
    playerStats.score === playerStats.highScore && playerStats.score > 0;

  const handlePlayAgain = () => {
    console.log("Play Again clicked");
    resetGame();
  };

  const handleMainMenu = () => {
    console.log("Main Menu clicked");
    quitGame();
  };

  return (
    <div className="game-over-overlay">
      <div className="game-over-content">
        <h1 className="game-over-title">GAME OVER</h1>

        {isNewHighScore && (
          <div className="new-high-score">
            <h2>NEW HIGH SCORE!</h2>
            <div className="score-highlight">
              {playerStats.score.toLocaleString()}
            </div>
          </div>
        )}

        <div className="game-over-stats">
          <div className="stat-item">
            <span className="stat-label">Final Score</span>
            <span className="stat-value">
              {playerStats.score.toLocaleString()}
            </span>
          </div>

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

        <div className="game-over-buttons">
          <button className="play-again-button" onClick={handlePlayAgain}>
            PLAY AGAIN
          </button>
          <button className="main-menu-button" onClick={handleMainMenu}>
            MAIN MENU
          </button>
        </div>

        <div className="game-over-tip">
          <p>Avoid the obstacles to survive longer!</p>
        </div>
      </div>
    </div>
  );
}

export default GameOverScreen;
