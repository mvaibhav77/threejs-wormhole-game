import { TunnelWireframe } from "./TunnelWireframe";
import { TunnelObstacles } from "./TunnelObstacles";

function WormholeTunnel() {
  return (
    <group>
      <TunnelWireframe />
      <TunnelObstacles />
    </group>
  );
}

export default WormholeTunnel;
