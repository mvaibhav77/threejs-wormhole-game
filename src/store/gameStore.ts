import { create } from "zustand";

// Game states
export type GameState = "menu" | "playing" | "paused" | "gameOver";

// Player stats interface
interface PlayerStats {
  score: number;
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
  playerMovementSpeed: number; // How fast the player can move
  movementBounds: number; // Maximum distance from tunnel center
}

// Main game store interface
interface GameStore {
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
  playerPosition: {
    x: number;
    y: number;
    z: number;
  };

  // Actions
  setGameState: (state: GameState) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  resetGame: () => void;

  updatePlayerPosition: (x: number, y: number, z: number) => void;
  updateScore: (points: number) => void;

  // Timing helpers
  setGameStartTime: (time: number) => void;
  getAdjustedGameTime: (currentTime: number) => number;

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
  playerMovementSpeed: 0.03, // Speed of player movement
  movementBounds: 0.4, // Maximum distance from tunnel center
};

// LocalStorage key for persisting high score
const HIGH_SCORE_KEY = "wormhole-high-score";

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

// Default player stats
const defaultPlayerStats: PlayerStats = {
  score: 0,
  highScore: loadHighScore(),
  gamesPlayed: 0,
};

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

  startGame: () =>
    set({
      gameState: "playing",
      isNavigationActive: true,
      gameStartTime: null, // Will be set by the game component
      totalPausedTime: 0,
      lastPauseTime: null,
      playerStats: {
        ...get().playerStats,
        score: 0,
        gamesPlayed: get().playerStats.gamesPlayed + 1,
      },
    }),

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

  // Timing helpers
  setGameStartTime: (time: number) => set({ gameStartTime: time }),

  getAdjustedGameTime: (currentTime: number) => {
    const { gameStartTime, totalPausedTime } = get();
    if (!gameStartTime) return 0;
    return currentTime - gameStartTime - totalPausedTime;
  },

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
