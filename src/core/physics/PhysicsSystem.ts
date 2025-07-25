/**
 * Physics system for player movement and bounds checking
 */

import { Position3D, GameSettings } from "../../types/game";

export interface MovementInput {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class PhysicsSystem {
  /**
   * Update player position based on input and game settings
   */
  updatePlayerPosition(
    currentPosition: Position3D,
    input: MovementInput,
    settings: GameSettings
    // deltaTime: number
  ): Position3D {
    let { x, y, z } = currentPosition;
    const speed = settings.playerMovementSpeed;
    const bounds = settings.movementBounds;

    // Apply movement based on input
    if (input.up) y += speed;
    if (input.down) y -= speed;
    if (input.left) x -= speed;
    if (input.right) x += speed;

    // Apply bounds checking
    x = Math.max(-bounds, Math.min(bounds, x));
    y = Math.max(-bounds, Math.min(bounds, y));

    return { x, y, z };
  }

  /**
   * Calculate circular movement for smooth navigation
   */
  calculateCircularMovement(
    currentPosition: Position3D,
    input: MovementInput,
    settings: GameSettings
  ): { screenX: number; screenY: number } {
    const maxRadius = settings.movementBounds;
    const speed = settings.playerMovementSpeed;

    // Get current position in circular coordinates
    let angle = Math.atan2(currentPosition.y, currentPosition.x);
    let radius = Math.sqrt(currentPosition.x ** 2 + currentPosition.y ** 2);

    // Apply angular movement
    if (input.left) angle -= speed * 2;
    if (input.right) angle += speed * 2;

    // Apply radial movement
    if (input.up) radius = Math.min(maxRadius, radius + speed);
    if (input.down) radius = Math.max(0, radius - speed);

    // Convert back to screen coordinates
    const screenX = Math.cos(angle) * radius;
    const screenY = Math.sin(angle) * radius;

    return { screenX, screenY };
  }

  /**
   * Check if position is within bounds
   */
  isWithinBounds(position: Position3D, bounds: number): boolean {
    return Math.abs(position.x) <= bounds && Math.abs(position.y) <= bounds;
  }

  /**
   * Calculate distance between two positions
   */
  calculateDistance(pos1: Position3D, pos2: Position3D): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Normalize a position vector
   */
  normalize(position: Position3D): Position3D {
    const length = Math.sqrt(
      position.x ** 2 + position.y ** 2 + position.z ** 2
    );
    if (length === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: position.x / length,
      y: position.y / length,
      z: position.z / length,
    };
  }
}
