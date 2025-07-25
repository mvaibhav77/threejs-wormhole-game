import { useRef } from "react";
import { Vector3, Color, Scene } from "three";
import { GameSettings } from "../types";

interface CollisionState {
  hasCollided: boolean;
  collisionTime: number;
  originalBackground: Color | null;
}

export function useCollisionDetection(
  boxPositions: Vector3[],
  gameSettings: GameSettings
) {
  const collisionState = useRef<CollisionState>({
    hasCollided: false,
    collisionTime: 0,
    originalBackground: null,
  });

  const checkCollision = (
    cameraPosition: Vector3,
    gameTime: number
  ): boolean => {
    // Only check collisions if obstacles are visible (after grace period)
    const gameTimeInSeconds = gameTime / 1000;
    if (gameTimeInSeconds < gameSettings.gracePerodSeconds) {
      return false;
    }

    const collisionRadius = 0.1; // Player collision radius (camera radius)
    const boxRadius = 0.075; // Box collision radius (should match box size)

    // Check collision with each box position
    for (const boxPos of boxPositions) {
      const distance = cameraPosition.distanceTo(boxPos);

      if (distance < collisionRadius + boxRadius) {
        return true; // Collision detected!
      }
    }

    return false;
  };

  const resetCollisionState = (scene: Scene) => {
    collisionState.current.hasCollided = false;
    collisionState.current.collisionTime = 0;
    collisionState.current.originalBackground = null;

    // Restore original background if needed
    if (collisionState.current.originalBackground) {
      scene.background = collisionState.current.originalBackground;
    }
  };

  return {
    collisionState,
    checkCollision,
    resetCollisionState,
  };
}
