import { useGameStore } from "../store/gameStore";
import { useKeyboardControls } from "./useKeyboardControls";

interface PlayerMovementParams {
  delta: number;
}

export function usePlayerMovement() {
  const { gameSettings, playerPosition, updatePlayerPosition } = useGameStore();
  const keys = useKeyboardControls();

  const updatePlayerMovement = ({ delta }: PlayerMovementParams) => {
    // Handle player movement in screen-relative coordinates
    let screenX = playerPosition.x;
    let screenY = playerPosition.y;

    const movementSpeed = gameSettings.playerMovementSpeed * delta * 60;
    if (keys.left) screenX -= movementSpeed;
    if (keys.right) screenX += movementSpeed;
    if (keys.up) screenY += movementSpeed;
    if (keys.down) screenY -= movementSpeed;

    // Convert screen coordinates to circular tunnel coordinates
    const maxRadius = 0.4;

    // Calculate distance from center
    const distanceFromCenter = Math.sqrt(screenX * screenX + screenY * screenY);

    // Constrain movement to circular boundary
    if (distanceFromCenter > maxRadius) {
      const angle = Math.atan2(screenY, screenX);
      screenX = Math.cos(angle) * maxRadius;
      screenY = Math.sin(angle) * maxRadius;
    }

    // Update player position in store
    updatePlayerPosition(screenX, screenY, playerPosition.z);

    return { screenX, screenY };
  };

  return {
    updatePlayerMovement,
    currentPosition: playerPosition,
  };
}
