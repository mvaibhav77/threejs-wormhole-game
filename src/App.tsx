import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Color, FogExp2, ACESFilmicToneMapping } from "three";
import { useGameStore } from "./store/gameStore";
import { usePauseControls } from "./hooks/usePauseControls";
import WormholeTunnel from "./components/3dComponents/WormholeTunnel";
import HomeScreen from "./components/UI/HomeScreen";
import GracePeriodTimer from "./components/UI/GracePeriodTimer";
import PlayerIndicator from "./components/UI/PlayerIndicator";
import PauseMenu from "./components/UI/PauseMenu";
import PauseButton from "./components/UI/PauseButton";
import ScoreDisplay from "./components/UI/ScoreDisplay";

function App() {
  const { gameState } = useGameStore();
  const showHomeScreen = gameState === "menu";

  // Enable pause controls
  usePauseControls();

  const handleStartGame = () => {
    // Game start logic will be handled by the store
    console.log("Game started!");
  };

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

      {/* UI Overlays */}
      {showHomeScreen && <HomeScreen onStartGame={handleStartGame} />}

      {/* Pause Button */}
      <PauseButton />

      {/* Grace Period Timer */}
      <GracePeriodTimer />

      {/* Player Indicator */}
      <PlayerIndicator />

      {/* Pause Menu */}
      <PauseMenu />

      {/* Score Display */}
      <ScoreDisplay />
    </div>
  );
}

export default App;
