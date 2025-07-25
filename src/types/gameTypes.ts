/**
 * Core game type definitions
 */

// Game states
export type GameState = "menu" | "playing" | "paused" | "gameOver";

// Player statistics
export interface PlayerStats {
  score: number;
  highScore: number;
  gamesPlayed: number;
}

// Game configuration
export interface GameSettings {
  speed: number;
  obstacleCount: number;
  maxSpeed: number;
  maxObstacles: number;
  speedIncreaseRate: number;
  obstacleIncreaseRate: number;
  playerMovementSpeed: number;
  movementBounds: number;
}

// Player position in 3D space
export interface PlayerPosition {
  x: number;
  y: number;
  z: number;
}

// Game timing information
export interface GameTiming {
  gameStartTime: number | null;
  totalPausedTime: number;
  lastPauseTime: number | null;
}
