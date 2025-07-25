import { create } from "zustand";
import {
  GameStore,
  GameState,
  PlayerStats,
  defaultGameSettings,
  createDefaultPlayerStats,
  INITIAL_OBSTACLE_COUNT,
  BASE_SPEED,
  OBSTACLE_INCREASE_PERIOD,
  SPEED_INCREASE_PERIOD,
} from "../types";

// Re-export types for easier access by components
export type {
  GameState,
  PlayerStats,
  GameSettings,
  PlayerPosition,
} from "../types";

// LocalStorage keys for persisting game data
const HIGH_SCORE_KEY = "wormhole-high-score";
const GAMES_PLAYED_KEY = "wormhole-games-played";

// Load high score from localStorage
const loadHighScore = (): number => {
  try {
    const saved = localStorage.getItem(HIGH_SCORE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

// Save high score to localStorage
const saveHighScore = (score: number): void => {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
  } catch {
    // Ignore localStorage errors (e.g., in private browsing)
  }
};

// Load games played from localStorage
const loadGamesPlayed = (): number => {
  try {
    const saved = localStorage.getItem(GAMES_PLAYED_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch {
    return 0;
  }
};

// Save games played to localStorage
const saveGamesPlayed = (count: number): void => {
  try {
    localStorage.setItem(GAMES_PLAYED_KEY, count.toString());
  } catch {
    // Ignore localStorage errors (e.g., in private browsing)
  }
};

// Default player stats
const defaultPlayerStats: PlayerStats = createDefaultPlayerStats(
  loadHighScore(),
  loadGamesPlayed()
);

// Create the game store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: "menu",
  isNavigationActive: false,

  // Timing state
  gameStartTime: null,
  totalPausedTime: 0,
  lastPauseTime: null,

  playerStats: defaultPlayerStats,
  gameSettings: defaultGameSettings,

  playerPosition: {
    x: 0,
    y: 0,
    z: 0,
  },

  // Game state actions
  setGameState: (state: GameState) => set({ gameState: state }),

  startGame: () => {
    const currentStats = get().playerStats;
    const newGamesPlayed = currentStats.gamesPlayed + 1;

    // Save games played to localStorage
    saveGamesPlayed(newGamesPlayed);

    set({
      gameState: "playing",
      isNavigationActive: true,
      gameStartTime: null, // Will be set by the game component
      totalPausedTime: 0,
      lastPauseTime: null,
      gameSettings: { ...defaultGameSettings }, // Reset difficulty to base level
      playerStats: {
        ...currentStats,
        score: 0,
        gamesPlayed: newGamesPlayed,
      },
    });
  },

  pauseGame: () => {
    const currentTime = performance.now();
    set({
      gameState: "paused",
      isNavigationActive: false,
      lastPauseTime: currentTime,
    });
  },

  resumeGame: () => {
    const currentTime = performance.now();
    const { lastPauseTime, totalPausedTime } = get();
    const pauseDuration = lastPauseTime ? currentTime - lastPauseTime : 0;

    set({
      gameState: "playing",
      isNavigationActive: true,
      totalPausedTime: totalPausedTime + pauseDuration,
      lastPauseTime: null,
    });
  },

  endGame: () => {
    const currentStats = get().playerStats;
    const newHighScore = Math.max(currentStats.score, currentStats.highScore);

    // Save high score to localStorage
    if (newHighScore > currentStats.highScore) {
      saveHighScore(newHighScore);
    }

    set({
      gameState: "gameOver",
      isNavigationActive: false,
      playerStats: {
        ...currentStats,
        highScore: newHighScore,
      },
    });
  },

  quitGame: () => {
    const currentStats = get().playerStats;
    const newHighScore = Math.max(currentStats.score, currentStats.highScore);

    // Save high score to localStorage if it's a new record
    if (newHighScore > currentStats.highScore) {
      saveHighScore(newHighScore);
    }

    // Return to menu and reset game state
    set({
      gameState: "menu",
      isNavigationActive: false,
      gameStartTime: null,
      totalPausedTime: 0,
      lastPauseTime: null,
      playerStats: {
        ...currentStats,
        score: 0, // Reset current score
        highScore: newHighScore, // Keep the updated high score
      },
      gameSettings: defaultGameSettings,
      playerPosition: { x: 0, y: 0, z: 0 },
    });
  },

  resetGame: () =>
    set({
      gameState: "menu",
      isNavigationActive: false,
      gameStartTime: null,
      totalPausedTime: 0,
      lastPauseTime: null,
      playerStats: {
        ...get().playerStats,
        score: 0,
      },
      gameSettings: defaultGameSettings,
      playerPosition: { x: 0, y: 0, z: 0 },
    }),

  // Player actions
  updatePlayerPosition: (x: number, y: number, z: number) =>
    set({ playerPosition: { x, y, z } }),

  updateScore: (points: number) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        score: state.playerStats.score + points,
      },
    })),

  // Progressive difficulty system - only obstacle increases
  updateDifficulty: (gameTimeInSeconds: number) =>
    set((state) => {
      const { gameSettings } = state;
      const {
        maxObstacles,
        obstacleIncreaseRate,
        speedIncreaseRate,
        maxSpeed,
      } = gameSettings;

      // Calculate new obstacle count based on time (increase every 15 seconds)
      const obstacleMultiplier =
        Math.floor(gameTimeInSeconds / OBSTACLE_INCREASE_PERIOD) *
        obstacleIncreaseRate;
      const newObstacleCount = Math.min(
        INITIAL_OBSTACLE_COUNT + obstacleMultiplier,
        maxObstacles
      );

      // Calculate new speed based on time (increase every 20 seconds)
      const speedMultiplier =
        Math.floor(gameTimeInSeconds / SPEED_INCREASE_PERIOD) *
        speedIncreaseRate;
      const newSpeed = Math.min(BASE_SPEED + speedMultiplier, maxSpeed);

      return {
        gameSettings: {
          ...gameSettings,
          obstacleCount: newObstacleCount,
          speed: newSpeed,
        },
      };
    }),

  // Timing helpers
  setGameStartTime: (time: number) => set({ gameStartTime: time }),

  getAdjustedGameTime: (currentTime: number) => {
    const { gameStartTime, totalPausedTime } = get();
    if (!gameStartTime) return 0;
    return currentTime - gameStartTime - totalPausedTime;
  },

  resetDifficulty: () =>
    set({
      gameSettings: defaultGameSettings,
    }),

  // Clear all persistent data
  clearAllData: () => {
    try {
      localStorage.removeItem(HIGH_SCORE_KEY);
      localStorage.removeItem(GAMES_PLAYED_KEY);
    } catch {
      // Ignore localStorage errors
    }

    set({
      gameState: "menu",
      isNavigationActive: false,
      gameStartTime: null,
      totalPausedTime: 0,
      lastPauseTime: null,
      playerStats: {
        score: 0,
        highScore: 0,
        gamesPlayed: 0,
      },
      gameSettings: defaultGameSettings,
      playerPosition: { x: 0, y: 0, z: 0 },
    });
  },
}));
