import { useGameStore } from "../../store/gameStore";
import { BASE_SPEED, INITIAL_OBSTACLE_COUNT } from "../../types";
import "./ScoreDisplay.css";

function ScoreDisplay() {
  const { gameState, playerStats, gameSettings } = useGameStore();

  // Only show during gameplay
  if (gameState !== "playing") return null;

  // Calculate obstacle difficulty level indicator
  const obstaclePercent = Math.round(
    ((gameSettings.obstacleCount - INITIAL_OBSTACLE_COUNT) /
      (gameSettings.maxObstacles - INITIAL_OBSTACLE_COUNT)) *
      100
  ); // 40 is base obstacle count

  const speedPercent = Math.round(
    ((gameSettings.speed - BASE_SPEED) / (gameSettings.maxSpeed - BASE_SPEED)) *
      100
  );

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
        <div className="difficulty-item">
          <span className="difficulty-label">Speed</span>
          <span className="difficulty-value">{Math.max(0, speedPercent)}%</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
