import { useGameStore } from "../../store/gameStore";
import "./ScoreDisplay.css";

function ScoreDisplay() {
  const { gameState, playerStats } = useGameStore();

  // Only show during gameplay
  if (gameState !== "playing") return null;

  return (
    <div className="score-display">
      <div className="score-value">{playerStats.score.toLocaleString()}</div>
    </div>
  );
}

export default ScoreDisplay;
