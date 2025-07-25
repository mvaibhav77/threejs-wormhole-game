/**
 * Game timing system for handling pause/resume mechanics
 */

import { GameTiming } from "../../types/game";

export class GameTimer {
  private timing: GameTiming = {
    gameStartTime: null,
    totalPausedTime: 0,
    lastPauseTime: null,
  };

  /**
   * Start the game timer
   */
  start(): void {
    const now = performance.now();
    this.timing = {
      gameStartTime: now,
      totalPausedTime: 0,
      lastPauseTime: null,
    };
  }

  /**
   * Pause the game timer
   */
  pause(): void {
    this.timing.lastPauseTime = performance.now();
  }

  /**
   * Resume the game timer
   */
  resume(): void {
    if (this.timing.lastPauseTime) {
      const pauseDuration = performance.now() - this.timing.lastPauseTime;
      this.timing.totalPausedTime += pauseDuration;
      this.timing.lastPauseTime = null;
    }
  }

  /**
   * Get the adjusted game time (excluding paused time)
   */
  getAdjustedGameTime(currentTime: number = performance.now()): number {
    if (!this.timing.gameStartTime) return 0;
    return (
      currentTime - this.timing.gameStartTime - this.timing.totalPausedTime
    );
  }

  /**
   * Get the adjusted game time in seconds
   */
  getAdjustedGameTimeInSeconds(
    currentTime: number = performance.now()
  ): number {
    return this.getAdjustedGameTime(currentTime) / 1000;
  }

  /**
   * Check if the timer is currently running
   */
  isRunning(): boolean {
    return (
      this.timing.gameStartTime !== null && this.timing.lastPauseTime === null
    );
  }

  /**
   * Check if the timer is paused
   */
  isPaused(): boolean {
    return this.timing.lastPauseTime !== null;
  }

  /**
   * Reset the timer
   */
  reset(): void {
    this.timing = {
      gameStartTime: null,
      totalPausedTime: 0,
      lastPauseTime: null,
    };
  }

  /**
   * Get current timing state
   */
  getTiming(): GameTiming {
    return { ...this.timing };
  }
}
