import { useGameStore } from "../../store/gameStore";
import "./ScoreDisplay.css";

function ScoreDisplay() {
  const { gameState, playerStats, gameSettings } = useGameStore();

  // Only show during gameplay
  if (gameState !== "playing") return null;

  // Calculate obstacle difficulty level indicator
  const obstaclePercent = Math.round(
    ((gameSettings.obstacleCount - 40) / (gameSettings.maxObstacles - 40)) * 100
  ); // 40 is base obstacle count

  return (
    <div className="score-display">
      <div className="score-value">{playerStats.score.toLocaleString()}</div>
      <div className="difficulty-indicators">
        <div className="difficulty-item">
          <span className="difficulty-label">Obstacles</span>
          <span className="difficulty-value">
            {Math.max(0, obstaclePercent)}%
          </span>
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
