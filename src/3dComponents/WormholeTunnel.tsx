import { useMemo, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  TubeGeometry,
  EdgesGeometry,
  BoxGeometry,
  Vector3,
  Color,
} from "three";
import { useGameStore } from "../store/gameStore";
import { useKeyboardControls } from "../hooks/useKeyboardControls";
import spline from "./spline";

function CameraAnimation({ tubeGeometry }: { tubeGeometry: TubeGeometry }) {
  const { camera } = useThree();
  const {
    isNavigationActive,
    gameSettings,
    playerPosition,
    updatePlayerPosition,
  } = useGameStore();
  const keys = useKeyboardControls();

  useFrame((state, delta) => {
    // Only animate camera if navigation is active
    if (!isNavigationActive) return;

    // Calculate tunnel path position
    const time = state.clock.elapsedTime * gameSettings.currentSpeed;
    const loopTime = 10; // Duration of one loop in seconds
    const p = (time % loopTime) / loopTime; // Normalize t to [0, 1]

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
      <CameraAnimation tubeGeometry={tubeGeometry} />
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
  const { gameSettings, isNavigationActive } = useGameStore();
  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(spline, 222, 0.45, 16, true); // Match the wireframe tunnel radius
  }, []);

  const boxData = useMemo(() => {
    const numBoxes = gameSettings.obstacleCount;
    const size = 0.075;
    const boxGeo = new BoxGeometry(size, size, size);
    const boxes: BoxData[] = [];

    for (let i = 0; i < numBoxes; i += 1) {
      const p = (i / numBoxes + Math.random() * 0.1) % 1;
      const pos = tubeGeometry.parameters.path.getPointAt(p);
      pos.x += Math.random() - 0.4;
      pos.z += Math.random() - 0.4;

      const rotation = new Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      const color = new Color().setHSL(0.7 - p, 1, 0.5);
      const edges = new EdgesGeometry(boxGeo, 0.2);

      boxes.push({
        id: i,
        position: pos.clone(),
        rotation,
        color,
        edges,
      });
    }

    return boxes;
  }, [tubeGeometry, gameSettings.obstacleCount]);

  // Hide obstacles for the first 3 seconds of gameplay
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showObstacles, setShowObstacles] = useState(false);

  useFrame((state) => {
    if (isNavigationActive && gameStartTime === null) {
      setGameStartTime(state.clock.elapsedTime);
    }

    if (gameStartTime !== null) {
      const timeSinceStart = state.clock.elapsedTime - gameStartTime;
      setShowObstacles(timeSinceStart >= gameSettings.gracePerodSeconds); // Use configurable grace period
    }

    if (!isNavigationActive) {
      setGameStartTime(null);
      setShowObstacles(false);
    }
  });

  return (
    <>
      {showObstacles &&
        boxData.map((box) => (
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
