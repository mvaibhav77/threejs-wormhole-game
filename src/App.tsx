import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { OrbitControls } from "@react-three/drei";
import { Color, FogExp2, ACESFilmicToneMapping } from "three";
import WormholeTunnel from "./3dComponents/WormholeTunnel";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        camera={{
          position: [0, 0, 5],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        gl={{
          antialias: true,
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: "srgb",
        }}
        onCreated={({ scene }) => {
          scene.background = new Color(0x000011);
          scene.fog = new FogExp2(0x000011, 0.3);
        }}
      >
        {/* Lighting */}
        <hemisphereLight args={[0xffffff, 0x444444, 1]} />

        {/* Controls */}
        <OrbitControls enableDamping dampingFactor={0.03} />

        {/* Main Wormhole Component */}
        <WormholeTunnel />

        {/* Post-processing Effects */}
        <EffectComposer>
          <Bloom
            intensity={4}
            luminanceThreshold={0.002}
            luminanceSmoothing={0.4}
            height={300}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}

export default App;
