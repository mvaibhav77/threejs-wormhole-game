import { useMemo } from "react";
import { TubeGeometry, EdgesGeometry } from "three";
import spline from "./spline";

export function TunnelWireframe() {
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
