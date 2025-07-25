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
  const lastScoredDistance = useRef<number>(0);
  const startingOffset = useRef<number>(Math.random());
  const lastGameState = useRef<string>(gameState);
  const accumulatedDistance = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  // Reset starting offset for new games
  if (lastGameState.current === "menu" && gameState === "playing") {
    startingOffset.current = Math.random();
    accumulatedDistance.current = 0;
    lastFrameTime.current = 0;
    lastScoredDistance.current = 0;
  }
  lastGameState.current = gameState;

  const { collisionState, checkCollision, resetCollisionState } =
    useCollisionDetection(boxPositions, gameSettings);

  useFrame((_, delta) => {
    // Get fresh gameSettings inside useFrame to avoid closure issues
    const currentGameSettings = useGameStore.getState().gameSettings;

    // Reset collision state when game is not active or when returning to menu
    if (!isNavigationActive || gameState === "menu") {
      if (collisionState.current.hasCollided) {
        resetCollisionState(scene);
      }
      return;
    }

    // Handle collision state and effects
    const collisionCurrentTime = performance.now();

    // Check if we're in collision state
    if (collisionState.current.hasCollided) {
      const timeSinceCollision =
        collisionCurrentTime - collisionState.current.collisionTime;

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
      lastFrameTime.current = performance.now();
      lastScoredDistance.current = 0;
      return;
    }

    // Calculate distance traveled this frame based on current speed
    const currentTime = performance.now();
    if (lastFrameTime.current > 0) {
      const deltaTime = (currentTime - lastFrameTime.current) / 1000; // Convert to seconds
      const distanceThisFrame = deltaTime * currentGameSettings.speed;
      accumulatedDistance.current += distanceThisFrame;
    }
    lastFrameTime.current = currentTime;

    // Calculate tunnel path position using accumulated distance
    const loopTime = 10; // Duration of one loop in seconds
    const p =
      (accumulatedDistance.current / loopTime + startingOffset.current) % 1;

    // Calculate game time for scoring and collision detection (still needed for these systems)
    const gameTime = getAdjustedGameTime(currentTime);
    const gameTimeInSeconds = gameTime / 1000;

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
    const maxRadius = 0.3;

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

    // Update score based on distance traveled (10 points per unit distance)
    const distanceTraveled = accumulatedDistance.current;
    const distanceForScoring = Math.floor(distanceTraveled * 10); // 10 points per unit distance
    const lastScoreDistance = Math.floor(lastScoredDistance.current * 10);

    if (distanceForScoring > lastScoreDistance) {
      const pointsToAdd = distanceForScoring - lastScoreDistance;
      updateScore(pointsToAdd);
      lastScoredDistance.current = distanceTraveled;
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
