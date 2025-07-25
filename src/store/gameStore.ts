import { create } from "zustand";

// Game states
export type GameState = "menu" | "playing" | "paused" | "gameOver";

// Player stats interface
interface PlayerStats {
  score: number;
  survivalTime: number;
  highScore: number;
  gamesPlayed: number;
}

// Game settings interface
interface GameSettings {
  baseSpeed: number;
  currentSpeed: number;
  obstacleCount: number;
  maxSpeed: number;
  maxObstacles: number;
  speedIncreaseRate: number;
  obstacleIncreaseRate: number;
  gracePerodSeconds: number; // Grace period before obstacles appear
}

// Main game store interface
interface GameStore {
  // Game state
  gameState: GameState;
  isNavigationActive: boolean;

  // Player stats
  playerStats: PlayerStats;

  // Game settings
  gameSettings: GameSettings;

  // Player position (for camera control)
  playerPosition: {
    x: number;
    y: number;
    z: number;
  };

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  updatePlayerPosition: (x: number, y: number, z: number) => void;
  updateScore: (points: number) => void;
  updateSurvivalTime: (time: number) => void;

  // Difficulty progression
  increaseDifficulty: () => void;
  resetDifficulty: () => void;
}

// Default game settings
const defaultGameSettings: GameSettings = {
  baseSpeed: 0.12,
  currentSpeed: 0.12,
  obstacleCount: 55,
  maxSpeed: 0.3,
  maxObstacles: 120,
  speedIncreaseRate: 0.02,
  obstacleIncreaseRate: 5,
  gracePerodSeconds: 3, // 3 seconds before obstacles appear
};

// Default player stats
const defaultPlayerStats: PlayerStats = {
  score: 0,
  survivalTime: 0,
  highScore: 0,
  gamesPlayed: 0,
};

// Create the game store
export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  gameState: "menu",
  isNavigationActive: false,

  playerStats: defaultPlayerStats,
  gameSettings: defaultGameSettings,

  playerPosition: {
    x: 0,
    y: 0,
    z: 0,
  },

  // Game state actions
  setGameState: (state: GameState) => set({ gameState: state }),

  startGame: () =>
    set({
      gameState: "playing",
      isNavigationActive: true,
      playerStats: {
        ...get().playerStats,
        score: 0,
        survivalTime: 0,
        gamesPlayed: get().playerStats.gamesPlayed + 1,
      },
    }),

  pauseGame: () =>
    set({
      gameState: "paused",
      isNavigationActive: false,
    }),

  endGame: () => {
    const currentStats = get().playerStats;
    const newHighScore = Math.max(currentStats.score, currentStats.highScore);

    set({
      gameState: "gameOver",
      isNavigationActive: false,
      playerStats: {
        ...currentStats,
        highScore: newHighScore,
      },
    });
  },

  resetGame: () =>
    set({
      gameState: "menu",
      isNavigationActive: false,
      playerStats: {
        ...get().playerStats,
        score: 0,
        survivalTime: 0,
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

  updateSurvivalTime: (time: number) =>
    set((state) => ({
      playerStats: {
        ...state.playerStats,
        survivalTime: time,
      },
    })),

  // Difficulty progression
  increaseDifficulty: () => {
    const { gameSettings } = get();
    const newSpeed = Math.min(
      gameSettings.currentSpeed + gameSettings.speedIncreaseRate,
      gameSettings.maxSpeed
    );
    const newObstacleCount = Math.min(
      gameSettings.obstacleCount + gameSettings.obstacleIncreaseRate,
      gameSettings.maxObstacles
    );

    set({
      gameSettings: {
        ...gameSettings,
        currentSpeed: newSpeed,
        obstacleCount: newObstacleCount,
      },
    });
  },

  resetDifficulty: () =>
    set({
      gameSettings: defaultGameSettings,
    }),
}));
