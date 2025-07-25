import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";
import "./GracePeriodTimer.css";
import { GRACE_PERIOD_SECONDS, INITIAL_OBSTACLE_COUNT } from "../../types";

function GracePeriodTimer() {
  const { isNavigationActive, gameSettings, gameState } = useGameStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);
  const hasShownTimerThisGame = useRef(false);
  const previousGameState = useRef<string>("menu");

  useEffect(() => {
    // Reset the flag when we transition from "menu" TO "playing" (new game started)
    // This ensures we don't reset on pause->resume transitions
    if (gameState === "playing" && previousGameState.current === "menu") {
      hasShownTimerThisGame.current = false;
    }
    previousGameState.current = gameState;
  }, [gameState]);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const updateTimer = (currentTime: number) => {
      // Only show timer if navigation just became active AND we haven't shown it this game yet
      if (
        isNavigationActive &&
        startTime === null &&
        !hasShownTimerThisGame.current
      ) {
        startTime = currentTime;
        setShowTimer(true);
        hasShownTimerThisGame.current = true;
      }

      if (startTime !== null && isNavigationActive) {
        const elapsed = (currentTime - startTime) / 1000; // Convert to seconds
        const remaining = Math.max(0, GRACE_PERIOD_SECONDS - elapsed);
        setRemainingTime(remaining);

        if (remaining <= 0) {
          setShowTimer(false);
        } else {
          animationFrame = requestAnimationFrame(updateTimer);
        }
      } else if (!isNavigationActive) {
        setShowTimer(false);
        setRemainingTime(0);
      }
    };

    if (isNavigationActive && !hasShownTimerThisGame.current) {
      animationFrame = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isNavigationActive, GRACE_PERIOD_SECONDS]);

  if (!showTimer || remainingTime <= 0) {
    return null;
  }

  return (
    <div className="grace-period-timer">
      <div className="timer-countdown">{Math.ceil(remainingTime)}</div>
    </div>
  );
}

export default GracePeriodTimer;
