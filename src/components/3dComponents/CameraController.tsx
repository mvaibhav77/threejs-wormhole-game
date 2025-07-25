import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { TubeGeometry, Vector3, Color } from "three";
import { useGameStore } from "../../store/gameStore";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import { useCollisionDetection } from "../../hooks/useCollisionDetection";

interface CameraControllerProps {
  tubeGeometry: TubeGeometry;
  boxPositions: Vector3[];
}

export function CameraController({
  tubeGeometry,
  boxPositions,
}: CameraControllerProps) {
  const { camera, scene } = useThree();
  const {
    isNavigationActive,
    gameState,
    gameSettings,
    playerPosition,
    updatePlayerPosition,
    updateScore,
    updateDifficulty,
    getAdjustedGameTime,
    setGameStartTime,
    gameStartTime,
    endGame,
  } = useGameStore();

  const keys = useKeyboardControls();
  const lastScoreUpdateTime = useRef<number>(0);
  const startingOffset = useRef<number>(Math.random());
  const lastGameState = useRef<string>(gameState);

  // Reset starting offset for new games
  if (lastGameState.current === "menu" && gameState === "playing") {
    startingOffset.current = Math.random();
  }
  lastGameState.current = gameState;

  const { collisionState, checkCollision, resetCollisionState } =
    useCollisionDetection(boxPositions, gameSettings);

  useFrame((_, delta) => {
    // Reset collision state when game is not active or when returning to menu
    if (!isNavigationActive || gameState === "menu") {
      if (collisionState.current.hasCollided) {
        resetCollisionState(scene);
      }
      return;
    }

    // Handle collision state and effects
    const currentTime = performance.now();

    // Check if we're in collision state
    if (collisionState.current.hasCollided) {
      const timeSinceCollision =
        currentTime - collisionState.current.collisionTime;

      // Keep red background for 2 seconds
      if (timeSinceCollision < 2000) {
        // Make background flash red
        const intensity = Math.sin(timeSinceCollision * 0.01) * 0.3 + 0.7;
        scene.background = new Color(intensity, 0, 0);
        return;
      } else {
        // 2 seconds have passed, trigger game over
        if (collisionState.current.originalBackground) {
          scene.background = collisionState.current.originalBackground;
        }
        endGame();
        return;
      }
    }

    // Only animate camera if navigation is active and no collision
    if (!isNavigationActive) {
      return;
    }

    // Set game start time on first frame of gameplay
    if (gameStartTime === null) {
      setGameStartTime(performance.now());
      lastScoreUpdateTime.current = 0;
      return;
    }

    // Use adjusted game time for pause-aware calculations
    const gameTime = getAdjustedGameTime(performance.now());
    const gameTimeInSeconds = gameTime / 1000;

    // Calculate tunnel path position using adjusted game time
    const time = gameTimeInSeconds * gameSettings.currentSpeed;
    const loopTime = 10; // Duration of one loop in seconds
    const p = (time / loopTime + startingOffset.current) % 1;

    // Get tunnel center and direction
    const tunnelCenter = tubeGeometry.parameters.path.getPointAt(p);
    const tunnelDirection = tubeGeometry.parameters.path
      .getTangentAt(p)
      .normalize();

    // Create local coordinate system for the tunnel cross-section
    const worldUp = new Vector3(0, 1, 0);
    const tunnelRight = new Vector3()
      .crossVectors(tunnelDirection, worldUp)
      .normalize();
    const tunnelUp = new Vector3()
      .crossVectors(tunnelRight, tunnelDirection)
      .normalize();

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

    // Check for collision with obstacles using camera's actual position
    if (checkCollision(camera.position, gameTime)) {
      // Start collision effect
      if (!collisionState.current.hasCollided) {
        collisionState.current.hasCollided = true;
        collisionState.current.collisionTime = performance.now();
        collisionState.current.originalBackground = scene.background as Color;
      }
      return;
    }

    // Update score based on time survived (2 points per second)
    const currentSecond = Math.floor(gameTimeInSeconds);
    if (currentSecond > lastScoreUpdateTime.current) {
      const pointsToAdd = (currentSecond - lastScoreUpdateTime.current) * 2;
      updateScore(pointsToAdd);
      lastScoreUpdateTime.current = currentSecond;
    }

    // Update difficulty progression based on game time
    updateDifficulty(gameTimeInSeconds);

    // Calculate final camera position using tunnel's local coordinate system
    const cameraOffset = new Vector3()
      .addScaledVector(tunnelRight, screenX)
      .addScaledVector(tunnelUp, screenY);

    const finalCameraPosition = tunnelCenter.clone().add(cameraOffset);

    // Look ahead along the tunnel path (no tilting)
    const lookAtPoint = tubeGeometry.parameters.path.getPointAt((p + 0.01) % 1);

    camera.position.copy(finalCameraPosition);
    camera.lookAt(lookAtPoint);
  });

  return null;
}
