/**
 * Default game configuration values
 */

import { GameSettings, PlayerStats } from "./gameTypes";

// Default game settings
export const BASE_SPEED = 0.12; // Fixed speed - no progression
export const INITIAL_OBSTACLE_COUNT = 50; // Start with more obstacles but spread out
export const GRACE_PERIOD_SECONDS = 3; // 3 seconds before obstacles appear
export const SPEED_INCREASE_PERIOD = 20; // Speed increases every 20 seconds
export const OBSTACLE_INCREASE_PERIOD = 15; // Obstacles increase every 15 seconds

export const defaultGameSettings: GameSettings = {
  speed: BASE_SPEED, // Same as base speed
  obstacleCount: INITIAL_OBSTACLE_COUNT, // Start with more obstacles but spread out
  maxSpeed: 0.45, // Same as base speed (no increase)
  maxObstacles: 150, // Maximum number of obstacles allowed
  speedIncreaseRate: 0.03, // Speed increases by 0.03 every SPEED_INCREASE_PERIOD seconds
  obstacleIncreaseRate: 5, // Increase obstacle count by 5 every OBSTACLE_INCREASE_PERIOD seconds
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
