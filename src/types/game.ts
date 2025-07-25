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
  baseSpeed: number;
  currentSpeed: number;
  obstacleCount: number;
  maxSpeed: number;
  maxObstacles: number;
  speedIncreaseRate: number;
  obstacleIncreaseRate: number;
  playerMovementSpeed: number;
  movementBounds: number;
}

// Player position in 3D space
export interface Position3D {
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

// Input state
export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  pause: boolean;
  resume: boolean;
}

// Game events
export type GameEvent =
  | { type: "GAME_START" }
  | { type: "GAME_PAUSE" }
  | { type: "GAME_RESUME" }
  | { type: "GAME_END"; finalScore: number }
  | { type: "SCORE_UPDATE"; points: number }
  | { type: "POSITION_UPDATE"; position: Position3D }
  | { type: "DIFFICULTY_INCREASE" };
