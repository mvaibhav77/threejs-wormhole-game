/**
 * Scoring system logic
 */

export interface ScoringConfig {
  pointsPerSecond: number;
}

export class ScoringSystem {
  private config: ScoringConfig;
  private lastUpdateTime: number = 0;

  constructor(config: ScoringConfig = { pointsPerSecond: 2 }) {
    this.config = config;
  }

  /**
   * Calculate points earned based on survival time
   */
  calculateTimeBasedPoints(gameTimeInSeconds: number): number {
    const currentSecond = Math.floor(gameTimeInSeconds);

    if (currentSecond > this.lastUpdateTime) {
      const secondsElapsed = currentSecond - this.lastUpdateTime;
      const pointsEarned = secondsElapsed * this.config.pointsPerSecond;
      this.lastUpdateTime = currentSecond;
      return pointsEarned;
    }

    return 0;
  }

  /**
   * Reset the scoring system for a new game
   */
  reset(): void {
    this.lastUpdateTime = 0;
  }

  /**
   * Check if a score is a new high score
   */
  isNewHighScore(currentScore: number, previousHighScore: number): boolean {
    return currentScore > previousHighScore;
  }

  /**
   * Update scoring configuration
   */
  updateConfig(config: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }
}
