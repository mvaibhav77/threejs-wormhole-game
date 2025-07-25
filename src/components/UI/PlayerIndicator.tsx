import { useGameStore } from "../../store/gameStore";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import "./PlayerIndicator.css";

function PlayerIndicator() {
  const { gameState, playerPosition } = useGameStore();
  const keys = useKeyboardControls();

  // Only show during gameplay
  if (gameState !== "playing") return null;

  return (
    <div className="player-indicator-overlay">
      <div className="crosshair">
        <div className="crosshair-horizontal"></div>
        <div className="crosshair-vertical"></div>
      </div>

      {/* Movement indicators */}
      <div className="movement-indicators">
        <div
          className={`movement-arrow movement-up ${keys.up ? "active" : ""}`}
        >
          ↑
        </div>
        <div className="movement-row">
          <div
            className={`movement-arrow movement-left ${
              keys.left ? "active" : ""
            }`}
          >
            ←
          </div>
          <div
            className={`movement-arrow movement-right ${
              keys.right ? "active" : ""
            }`}
          >
            →
          </div>
        </div>
        <div
          className={`movement-arrow movement-down ${
            keys.down ? "active" : ""
          }`}
        >
          ↓
        </div>
      </div>

      {/* Optional: Position display for debugging */}
      <div className="position-debug">
        <span>X: {playerPosition.x.toFixed(2)}</span>
        <span>Y: {playerPosition.y.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default PlayerIndicator;
