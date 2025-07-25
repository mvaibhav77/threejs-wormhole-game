import { useGameStore } from "../../store/gameStore";
import "./PauseButton.css";

function PauseButton() {
  const { gameState, pauseGame } = useGameStore();

  // Only show the pause button when the game is playing
  if (gameState !== "playing") {
    return null;
  }

  const handlePause = () => {
    pauseGame();
  };

  return (
    <button
      className="pause-button"
      onClick={handlePause}
      title="Pause Game (ESC)"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="6" y="4" width="4" height="16" fill="currentColor" />
        <rect x="14" y="4" width="4" height="16" fill="currentColor" />
      </svg>
    </button>
  );
}

export default PauseButton;
