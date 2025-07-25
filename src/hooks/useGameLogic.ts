import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

/**
 * Custom hook to handle core game logic and state management
 * Separates game logic from UI components
 */
export function useGameLogic() {
  const {
    gameState,
    gameSettings,
    playerStats,
    startGame,
    pauseGame,
    resumeGame,
    quitGame,
    resetGame,
    updateScore,
    updateDifficulty,
    getAdjustedGameTime,
  } = useGameStore();

  // Game state helpers
  const isGamePlaying = gameState === "playing";
  const isGamePaused = gameState === "paused";
  const isGameOver = gameState === "gameOver";
  const isInMenu = gameState === "menu";

  // Game actions
  const handleStartGame = () => {
    startGame();
  };

  const handlePauseToggle = () => {
    if (isGamePlaying) {
      pauseGame();
    } else if (isGamePaused) {
      resumeGame();
    }
  };

  const handleQuitToMenu = () => {
    quitGame();
  };

  const handleRestartGame = () => {
    resetGame();
    startGame();
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case "Escape":
          if (isGamePlaying || isGamePaused) {
            handlePauseToggle();
          }
          break;
        case "r":
        case "R":
          if (isGameOver) {
            handleRestartGame();
          }
          break;
        case "q":
        case "Q":
          if (!isInMenu) {
            handleQuitToMenu();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameState]);

  return {
    // State
    gameState,
    gameSettings,
    playerStats,
    isGamePlaying,
    isGamePaused,
    isGameOver,
    isInMenu,

    // Actions
    handleStartGame,
    handlePauseToggle,
    handleQuitToMenu,
    handleRestartGame,

    // Game mechanics
    updateScore,
    updateDifficulty,
    getAdjustedGameTime,
  };
}
