import { ReactNode } from "react";
import { useGameStore } from "../../store/gameStore";
import ScoreDisplay from "./ScoreDisplay";
import PauseButton from "./PauseButton";
import GracePeriodTimer from "./GracePeriodTimer";
import PlayerIndicator from "./PlayerIndicator";

interface GameUILayoutProps {
  children?: ReactNode;
}

export function GameUILayout({ children }: GameUILayoutProps) {
  const { gameState } = useGameStore();

  if (gameState !== "playing") {
    return <>{children}</>;
  }

  return (
    <>
      {/* Game HUD Elements */}
      <ScoreDisplay />
      <PauseButton />
      <GracePeriodTimer />
      <PlayerIndicator />

      {/* Additional UI components */}
      {children}
    </>
  );
}
