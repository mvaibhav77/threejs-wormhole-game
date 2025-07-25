/**
 * Simplified game store using the new game engine
 */

import { create } from "zustand";
import { GameEngine } from "../core/game/GameEngine";
import {
  GameState,
  GameSettings,
  PlayerStats,
  Position3D,
} from "../types/game";

// Default game settings
const defaultGameSettings: GameSettings = {
  baseSpeed: 0.12,
  currentSpeed: 0.12,
  obstacleCount: 55,
  maxSpeed: 0.3,
  maxObstacles: 120,
  speedIncreaseRate: 0.02,
  obstacleIncreaseRate: 5,
  gracePerodSeconds: 3,
  playerMovementSpeed: 0.03,
  movementBounds: 0.4,
};

interface GameStore {
  // Core game state
  gameState: GameState;
  playerStats: PlayerStats;
  playerPosition: Position3D;
  gameSettings: GameSettings;

  // Game engine
  gameEngine: GameEngine | null;

  // Actions
  initializeEngine: () => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  // Getters
  isNavigationActive: () => boolean;
  getGameTimeInSeconds: () => number;
}

export const useGameStore = create<GameStore>((set, get) => {
  let gameEngine: GameEngine | null = null;

  const store: GameStore = {
    // Initial state
    gameState: "menu",
    playerStats: {
      score: 0,
      highScore: 0,
      gamesPlayed: 0,
    },
    playerPosition: { x: 0, y: 0, z: 0 },
    gameSettings: defaultGameSettings,
    gameEngine: null,

    // Initialize the game engine
    initializeEngine: () => {
      if (gameEngine) return; // Already initialized

      gameEngine = new GameEngine({
        gameSettings: defaultGameSettings,
        onStateChange: (gameState) => set({ gameState }),
        onStatsChange: (playerStats) => set({ playerStats }),
        onPositionChange: (playerPosition) => set({ playerPosition }),
        onEvent: (event) => {
          // Handle game events if needed
          console.log("Game event:", event);
        },
      });

      // Set initial state from engine
      set({
        gameEngine,
        gameState: gameEngine.getGameState(),
        playerStats: gameEngine.getPlayerStats(),
        playerPosition: gameEngine.getPlayerPosition(),
      });
    },

    // Game actions
    startGame: () => {
      const engine = get().gameEngine;
      if (engine) {
        engine.startGame();
      }
    },

    pauseGame: () => {
      const engine = get().gameEngine;
      if (engine) {
        engine.pauseGame();
      }
    },

    resumeGame: () => {
      const engine = get().gameEngine;
      if (engine) {
        engine.resumeGame();
      }
    },

    endGame: () => {
      const engine = get().gameEngine;
      if (engine) {
        engine.endGame();
      }
    },

    resetGame: () => {
      const engine = get().gameEngine;
      if (engine) {
        engine.resetToMenu();
      }
    },

    // Getters
    isNavigationActive: () => {
      const engine = get().gameEngine;
      return engine ? engine.isNavigationActive() : false;
    },

    getGameTimeInSeconds: () => {
      const engine = get().gameEngine;
      return engine ? engine.getGameTimeInSeconds() : 0;
    },
  };

  return store;
});
