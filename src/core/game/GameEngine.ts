/**
 * Main game engine that orchestrates all game systems
 */

import {
  GameState,
  GameSettings,
  PlayerStats,
  Position3D,
  GameEvent,
} from "../../types/game";
import { GameTimer } from "./GameTimer";
import { ScoringSystem } from "../scoring/ScoringSystem";
import { PhysicsSystem, MovementInput } from "../physics/PhysicsSystem";
import { storageService } from "../../services/storage";

export interface GameEngineConfig {
  gameSettings: GameSettings;
  onStateChange?: (state: GameState) => void;
  onStatsChange?: (stats: PlayerStats) => void;
  onPositionChange?: (position: Position3D) => void;
  onEvent?: (event: GameEvent) => void;
}

export class GameEngine {
  private gameState: GameState = "menu";
  private playerStats: PlayerStats;
  private playerPosition: Position3D = { x: 0, y: 0, z: 0 };
  private gameSettings: GameSettings;

  private gameTimer = new GameTimer();
  private scoringSystem = new ScoringSystem();
  private physicsSystem = new PhysicsSystem();

  private callbacks: {
    onStateChange?: (state: GameState) => void;
    onStatsChange?: (stats: PlayerStats) => void;
    onPositionChange?: (position: Position3D) => void;
    onEvent?: (event: GameEvent) => void;
  } = {};

  constructor(config: GameEngineConfig) {
    this.gameSettings = config.gameSettings;
    this.callbacks = {
      onStateChange: config.onStateChange,
      onStatsChange: config.onStatsChange,
      onPositionChange: config.onPositionChange,
      onEvent: config.onEvent,
    };

    // Initialize player stats from storage
    this.playerStats = {
      score: 0,
      highScore: storageService.getHighScore(),
      gamesPlayed: storageService.getGamesPlayed(),
    };
  }

  /**
   * Start a new game
   */
  startGame(): void {
    this.gameState = "playing";
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.playerStats.score = 0;
    this.playerStats.gamesPlayed += 1;

    // Update storage
    storageService.setGamesPlayed(this.playerStats.gamesPlayed);

    // Start game systems
    this.gameTimer.start();
    this.scoringSystem.reset();

    // Notify listeners
    this.emitStateChange();
    this.emitStatsChange();
    this.emitEvent({ type: "GAME_START" });
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      this.gameTimer.pause();
      this.emitStateChange();
      this.emitEvent({ type: "GAME_PAUSE" });
    }
  }

  /**
   * Resume the game
   */
  resumeGame(): void {
    if (this.gameState === "paused") {
      this.gameState = "playing";
      this.gameTimer.resume();
      this.emitStateChange();
      this.emitEvent({ type: "GAME_RESUME" });
    }
  }

  /**
   * End the game
   */
  endGame(): void {
    this.gameState = "gameOver";

    // Check for high score
    if (
      this.scoringSystem.isNewHighScore(
        this.playerStats.score,
        this.playerStats.highScore
      )
    ) {
      this.playerStats.highScore = this.playerStats.score;
      storageService.setHighScore(this.playerStats.highScore);
    }

    this.emitStateChange();
    this.emitStatsChange();
    this.emitEvent({ type: "GAME_END", finalScore: this.playerStats.score });
  }

  /**
   * Reset to menu
   */
  resetToMenu(): void {
    this.gameState = "menu";
    this.playerPosition = { x: 0, y: 0, z: 0 };
    this.playerStats.score = 0;
    this.gameTimer.reset();
    this.scoringSystem.reset();
    this.emitStateChange();
    this.emitStatsChange();
    this.emitPositionChange();
  }

  /**
   * Update game logic (should be called every frame)
   */
  update(input: MovementInput): void {
    if (this.gameState !== "playing") return;

    // Update player position
    this.playerPosition = this.physicsSystem.updatePlayerPosition(
      this.playerPosition,
      input,
      this.gameSettings
      // 0.016 // Approximate 60fps delta
    );

    // Update score based on survival time
    const gameTime = this.gameTimer.getAdjustedGameTimeInSeconds();
    const pointsEarned = this.scoringSystem.calculateTimeBasedPoints(gameTime);

    if (pointsEarned > 0) {
      this.playerStats.score += pointsEarned;
      this.emitStatsChange();
      this.emitEvent({ type: "SCORE_UPDATE", points: pointsEarned });
    }

    this.emitPositionChange();
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Get player statistics
   */
  getPlayerStats(): PlayerStats {
    return { ...this.playerStats };
  }

  /**
   * Get player position
   */
  getPlayerPosition(): Position3D {
    return { ...this.playerPosition };
  }

  /**
   * Get game settings
   */
  getGameSettings(): GameSettings {
    return { ...this.gameSettings };
  }

  /**
   * Get adjusted game time in seconds
   */
  getGameTimeInSeconds(): number {
    return this.gameTimer.getAdjustedGameTimeInSeconds();
  }

  /**
   * Check if navigation should be active
   */
  isNavigationActive(): boolean {
    return this.gameState === "playing";
  }

  // Private event emission methods
  private emitStateChange(): void {
    this.callbacks.onStateChange?.(this.gameState);
  }

  private emitStatsChange(): void {
    this.callbacks.onStatsChange?.(this.getPlayerStats());
  }

  private emitPositionChange(): void {
    this.callbacks.onPositionChange?.(this.getPlayerPosition());
  }

  private emitEvent(event: GameEvent): void {
    this.callbacks.onEvent?.(event);
  }
}
