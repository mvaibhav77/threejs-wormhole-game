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
import spline from "./spline";

function CameraAnimation({ tubeGeometry }: { tubeGeometry: TubeGeometry }) {
  const { camera } = useThree();
  const { isNavigationActive, gameSettings } = useGameStore();

  useFrame((state) => {
    // Only animate camera if navigation is active
    if (!isNavigationActive) return;

    const time = state.clock.elapsedTime * gameSettings.currentSpeed;
    const loopTime = 10; // Duration of one loop in seconds
    const p = (time % loopTime) / loopTime; // Normalize t to [0, 1]

    const pos = tubeGeometry.parameters.path.getPointAt(p);
    const lookAt = tubeGeometry.parameters.path.getPointAt((p + 0.01) % 1); // Look ahead slightly

    camera.position.copy(pos);
    camera.lookAt(lookAt);
  });

  return null;
}

function TunnelWireframe() {
  const tubeGeometry = useMemo(() => {
    return new TubeGeometry(spline, 222, 0.66, 16, true);
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
    return new TubeGeometry(spline, 222, 0.66, 16, true);
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
