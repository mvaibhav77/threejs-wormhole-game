import { useMemo } from "react";
import {
  TubeGeometry,
  BoxGeometry,
  EdgesGeometry,
  Vector3,
  Color,
} from "three";

export interface BoxData {
  id: number;
  position: Vector3;
  rotation: Vector3;
  color: Color;
  edges: EdgesGeometry<BoxGeometry>;
}

interface ObstacleGenerationParams {
  tubeGeometry: TubeGeometry;
  currentGameOffset: number;
  obstacleCount: number;
}

export function useObstacleGeneration({
  tubeGeometry,
  currentGameOffset,
  obstacleCount,
}: ObstacleGenerationParams) {
  const { currentBoxData, currentBoxPositions } = useMemo(() => {
    const maxPossibleBoxes = 120; // Total possible boxes for distribution
    const currentBoxCount = obstacleCount;
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
  }, [tubeGeometry, currentGameOffset, obstacleCount]);

  return { currentBoxData, currentBoxPositions };
}
