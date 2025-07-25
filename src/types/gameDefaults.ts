/**
 * Default game configuration values
 */

import { GameSettings, PlayerStats } from "./gameTypes";

// Default game settings
export const defaultGameSettings: GameSettings = {
  baseSpeed: 0.15, // Fixed speed - no progression
  currentSpeed: 0.15, // Same as base speed
  obstacleCount: 40, // Start with more obstacles but spread out
  maxSpeed: 0.15, // Same as base speed (no increase)
  maxObstacles: 120,
  speedIncreaseRate: 0, // No speed increases
  obstacleIncreaseRate: 5,
  gracePerodSeconds: 3, // 3 seconds before obstacles appear
  playerMovementSpeed: 0.03, // Speed of player movement
  movementBounds: 0.4, // Maximum distance from tunnel center
};

// Default player stats (will be populated with localStorage values)
export const createDefaultPlayerStats = (
  highScore: number = 0,
  gamesPlayed: number = 0
): PlayerStats => ({
  score: 0,
  highScore,
  gamesPlayed,
});
