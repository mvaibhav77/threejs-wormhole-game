/**
 * Custom hook for game logic integration with React
 */

import { useEffect } from "react";
import { useGameStore } from "../store/gameStoreNew";
import { useKeyboardControls } from "./useKeyboardControls";

export const useGameEngine = () => {
  const store = useGameStore();
  const keys = useKeyboardControls();

  // Initialize the game engine on first render
  useEffect(() => {
    store.initializeEngine();
  }, [store]);

  // Update game engine with input every frame
  useEffect(() => {
    if (!store.gameEngine || !store.isNavigationActive()) return;

    const gameLoop = () => {
      const input = {
        up: keys.up,
        down: keys.down,
        left: keys.left,
        right: keys.right,
      };

      store.gameEngine!.update(input);
    };

    let animationFrame: number;
    const runGameLoop = () => {
      gameLoop();
      animationFrame = requestAnimationFrame(runGameLoop);
    };

    runGameLoop();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [store.gameEngine, store.isNavigationActive, keys]);

  return {
    gameState: store.gameState,
    playerStats: store.playerStats,
    playerPosition: store.playerPosition,
    gameSettings: store.gameSettings,
    startGame: store.startGame,
    pauseGame: store.pauseGame,
    resumeGame: store.resumeGame,
    endGame: store.endGame,
    resetGame: store.resetGame,
    isNavigationActive: store.isNavigationActive(),
    getGameTimeInSeconds: store.getGameTimeInSeconds,
  };
};
