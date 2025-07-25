/**
 * Store-specific type definitions
 */

import {
  GameState,
  PlayerStats,
  GameSettings,
  PlayerPosition,
} from "./gameTypes";

// Main game store interface
export interface GameStore {
  // Game state
  gameState: GameState;
  isNavigationActive: boolean;

  // Timing for pause/resume
  gameStartTime: number | null;
  totalPausedTime: number;
  lastPauseTime: number | null;

  // Player stats
  playerStats: PlayerStats;

  // Game settings
  gameSettings: GameSettings;

  // Player position (for camera control)
  playerPosition: PlayerPosition;

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  quitGame: () => void;
  resetGame: () => void;

  updatePlayerPosition: (x: number, y: number, z: number) => void;
  updateScore: (points: number) => void;
  updateDifficulty: (gameTimeInSeconds: number) => void;

  // Timing helpers
  setGameStartTime: (time: number) => void;
  getAdjustedGameTime: (currentTime: number) => number;

  // Difficulty progression
  increaseDifficulty: () => void;
  resetDifficulty: () => void;

  // Data management
  clearAllData: () => void;
}
