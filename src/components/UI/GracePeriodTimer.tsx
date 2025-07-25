import { useState, useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";
import "./GracePeriodTimer.css";

function GracePeriodTimer() {
  const { isNavigationActive, gameSettings, gameState } = useGameStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);
  const hasShownTimerThisGame = useRef(false);

  useEffect(() => {
    // Reset the flag when game state changes to playing (new game started)
    if (gameState === "playing" && !isNavigationActive) {
      hasShownTimerThisGame.current = false;
    }
  }, [gameState, isNavigationActive]);

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
        const remaining = Math.max(0, gameSettings.gracePerodSeconds - elapsed);
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
  }, [isNavigationActive, gameSettings.gracePerodSeconds]);

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
