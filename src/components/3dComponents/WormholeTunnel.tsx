import { useMemo, useState, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  TubeGeometry,
  EdgesGeometry,
  BoxGeometry,
  Vector3,
  Color,
} from "three";
import { useGameStore } from "../../store/gameStore";
import { useKeyboardControls } from "../../hooks/useKeyboardControls";
import spline from "./spline";

function CameraAnimation({
  tubeGeometry,
  boxPositions,
}: {
  tubeGeometry: TubeGeometry;
  boxPositions: Vector3[];
}) {
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
  const startingOffset = useRef<number>(Math.random()); // Random starting position
  const lastGameState = useRef<string>(gameState);

  // Check if game state changed to playing from menu (new game started)
  if (lastGameState.current === "menu" && gameState === "playing") {
    startingOffset.current = Math.random(); // New random start for new game
  }
  lastGameState.current = gameState;

  const collisionState = useRef<{
    hasCollided: boolean;
    collisionTime: number;
    originalBackground: Color | null;
  }>({
    hasCollided: false,
    collisionTime: 0,
    originalBackground: null,
  });

  // Collision detection function using actual camera position
  const checkCollision = (cameraPosition: Vector3, gameTime: number) => {
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

  useFrame((_, delta) => {
    // Reset collision state when game is not active or when returning to menu
    if (!isNavigationActive || gameState === "menu") {
      if (collisionState.current.hasCollided) {
        // Reset collision state
        collisionState.current.hasCollided = false;
        collisionState.current.collisionTime = 0;
        collisionState.current.originalBackground = null;

        // Restore original background if needed
        if (collisionState.current.originalBackground) {
          scene.background = collisionState.current.originalBackground;
        }
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
        const intensity = Math.sin(timeSinceCollision * 0.01) * 0.3 + 0.7; // Pulsing effect
        scene.background = new Color(intensity, 0, 0);
        return; // Don't process movement or other updates
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
      lastScoreUpdateTime.current = 0; // Reset score tracking for new game
      return; // Skip this frame to allow the start time to be set
    }

    // Use adjusted game time for pause-aware calculations
    const gameTime = getAdjustedGameTime(performance.now());
    const gameTimeInSeconds = gameTime / 1000;

    // Calculate tunnel path position using adjusted game time
    const time = gameTimeInSeconds * gameSettings.currentSpeed;
    const loopTime = 10; // Duration of one loop in seconds
    const p = (time / loopTime + startingOffset.current) % 1; // Add random starting offset

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
    const maxRadius = 0.4; // Back to reasonable movement radius

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
      return; // Stop processing this frame
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

function TunnelWireframe() {
  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(spline, 222, 0.45, 16, true);
  }, []);

  const edges = useMemo(() => {
    return new EdgesGeometry(tubeGeometry, 0.2);
  }, [tubeGeometry]);

  return (
    <>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={0x8888ff} />
      </lineSegments>
    </>
  );
}

interface BoxData {
  id: number;
  position: Vector3;
  rotation: Vector3;
  color: Color;
  edges: EdgesGeometry<BoxGeometry>;
}

function TunnelBoxes() {
  const { gameSettings, isNavigationActive, getAdjustedGameTime, gameState } =
    useGameStore();
  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(spline, 222, 0.45, 16, true); // Match the wireframe tunnel radius
  }, []);

  // Store the starting offset for this game session - only regenerate when game restarts
  const lastGameState = useRef<string>(gameState);
  const [currentGameOffset, setCurrentGameOffset] = useState<number>(
    Math.random()
  );

  // Check if game state changed to playing from menu (new game started)
  if (lastGameState.current === "menu" && gameState === "playing") {
    setCurrentGameOffset(Math.random()); // New random start for new game
  }
  lastGameState.current = gameState;

  // Generate boxes based on current obstacle count - starts small and grows
  const { currentBoxData, currentBoxPositions } = useMemo(() => {
    const maxPossibleBoxes = 120; // Total possible boxes for distribution
    const currentBoxCount = gameSettings.obstacleCount; // Use current obstacle count
    const size = 0.075;
    const boxGeo = new BoxGeometry(size, size, size);
    const boxes: BoxData[] = [];
    const positions: Vector3[] = [];

    // Generate indices for even distribution across the tunnel
    const selectedIndices: number[] = [];

    // Create evenly spaced indices with some randomization to avoid patterns
    for (let i = 0; i < currentBoxCount; i++) {
      // Calculate base position with even spacing
      const basePosition = (i / currentBoxCount) * maxPossibleBoxes;

      // Add some deterministic randomness based on the position
      const randomSeed = Math.sin(i * 17.32 + currentGameOffset * 100) * 0.5;
      const spacing = maxPossibleBoxes / currentBoxCount;
      const jitter = randomSeed * spacing * 0.3; // 30% jitter

      // Ensure we stay within bounds and avoid duplicates
      let index = Math.floor(basePosition + jitter);
      index = Math.max(0, Math.min(maxPossibleBoxes - 1, index));

      // Avoid duplicates by checking if index is already used
      while (
        selectedIndices.includes(index) &&
        selectedIndices.length < maxPossibleBoxes
      ) {
        index = (index + 1) % maxPossibleBoxes;
      }

      selectedIndices.push(index);
    }

    // Generate boxes using the selected indices for consistent distribution
    selectedIndices.forEach((boxIndex) => {
      // Use deterministic "random" for consistent positioning based on original index
      const randomOffset = (Math.sin(boxIndex * 12.9898) * 43758.5453) % 1;
      // Distribute boxes evenly around the tunnel using the original max distribution
      const p = (boxIndex / maxPossibleBoxes + randomOffset * 0.1) % 1;
      const finalP = (p + currentGameOffset) % 1;
      const pos = tubeGeometry.parameters.path.getPointAt(finalP);

      // Position boxes in a circular pattern around the tunnel
      const angle = (boxIndex * 3.5) % (Math.PI * 2);
      const radius = 0.35;
      pos.x += Math.cos(angle) * radius;
      pos.z += Math.sin(angle) * radius;

      // Use deterministic rotation based on original box index
      const rotation = new Vector3(
        ((Math.sin(boxIndex * 7.319) * 43758.5453) % 1) * Math.PI,
        ((Math.sin(boxIndex * 13.547) * 43758.5453) % 1) * Math.PI,
        ((Math.sin(boxIndex * 19.123) * 43758.5453) % 1) * Math.PI
      );

      const color = new Color().setHSL(0.7 - finalP, 1, 0.5);
      const edges = new EdgesGeometry(boxGeo, 0.2);

      boxes.push({
        id: boxIndex, // Use original index for consistent identification
        position: pos.clone(),
        rotation,
        color,
        edges,
      });

      // Store position for collision detection
      positions.push(pos.clone());
    });

    return { currentBoxData: boxes, currentBoxPositions: positions };
  }, [tubeGeometry, currentGameOffset, gameSettings.obstacleCount]); // Regenerate when obstacle count changes

  // Hide obstacles for the first 3 seconds of gameplay
  const [showObstacles, setShowObstacles] = useState(false);

  useFrame(() => {
    if (!isNavigationActive) {
      setShowObstacles(false);
      return;
    }

    // Use adjusted game time for pause-aware grace period
    const gameTime = getAdjustedGameTime(performance.now());
    const gameTimeInSeconds = gameTime / 1000;
    setShowObstacles(gameTimeInSeconds >= gameSettings.gracePerodSeconds); // Use configurable grace period
  });

  return (
    <>
      {/* Camera Animation with collision detection */}
      <CameraAnimation
        tubeGeometry={tubeGeometry}
        boxPositions={currentBoxPositions}
      />

      {/* Render obstacles */}
      {showObstacles &&
        currentBoxData.map((box) => (
          <lineSegments
            key={box.id}
            geometry={box.edges}
            position={[box.position.x, box.position.y, box.position.z]}
            rotation={[box.rotation.x, box.rotation.y, box.rotation.z]}
          >
            <lineBasicMaterial color={box.color} />
          </lineSegments>
        ))}
    </>
  );
}

function WormholeTunnel() {
  return (
    <group>
      <TunnelWireframe />
      <TunnelBoxes />
    </group>
  );
}

export default WormholeTunnel;
