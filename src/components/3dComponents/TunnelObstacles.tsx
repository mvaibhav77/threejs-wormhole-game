import { useMemo, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TubeGeometry } from "three";
import { useGameStore } from "../../store/gameStore";
import { useObstacleGeneration } from "../../hooks/useObstacleGeneration";
import { CameraController } from "./CameraController";
import spline from "./spline";

export function TunnelObstacles() {
  const { gameSettings, isNavigationActive, getAdjustedGameTime, gameState } =
    useGameStore();

  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(spline, 222, 0.45, 16, true);
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

  // Generate obstacles using the custom hook
  const { currentBoxData, currentBoxPositions } = useObstacleGeneration({
    tubeGeometry,
    currentGameOffset,
    obstacleCount: gameSettings.obstacleCount,
  });

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
    setShowObstacles(gameTimeInSeconds >= gameSettings.gracePerodSeconds);
  });

  return (
    <>
      {/* Camera Animation with collision detection */}
      <CameraController
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
