import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";

export const usePauseControls = () => {
  const { gameState, pauseGame, resumeGame } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle these keys if they're not being handled elsewhere
      if (event.code === "Escape") {
        event.preventDefault();
        if (gameState === "playing") {
          pauseGame();
        } else if (gameState === "paused") {
          resumeGame();
        }
      } else if (event.code === "Space" && gameState === "paused") {
        event.preventDefault();
        resumeGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameState, pauseGame, resumeGame]);
};
