import { useState, useEffect } from "react";
import { useGameStore } from "../../store/gameStore";
import "./GracePeriodTimer.css";

function GracePeriodTimer() {
  const { isNavigationActive, gameSettings } = useGameStore();
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const updateTimer = (currentTime: number) => {
      if (isNavigationActive && startTime === null) {
        startTime = currentTime;
        setShowTimer(true);
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
        startTime = null;
        setShowTimer(false);
        setRemainingTime(0);
      }
    };

    if (isNavigationActive) {
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
      <div className="timer-content">
        <div className="timer-text">Obstacles incoming in</div>
        <div className="timer-countdown">{Math.ceil(remainingTime)}</div>
        <div className="timer-subtext">Get ready!</div>
      </div>
    </div>
  );
}

export default GracePeriodTimer;
