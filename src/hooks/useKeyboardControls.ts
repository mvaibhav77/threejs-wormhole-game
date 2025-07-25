import { useEffect, useRef } from "react";

interface KeyboardState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  escape: boolean;
  space: boolean;
}

export const useKeyboardControls = () => {
  const keysPressed = useRef<KeyboardState>({
    up: false,
    down: false,
    left: false,
    right: false,
    escape: false,
    space: false,
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keysPressed.current.up = true;
          break;
        case "ArrowDown":
        case "KeyS":
          keysPressed.current.down = true;
          break;
        case "ArrowLeft":
        case "KeyA":
          keysPressed.current.left = true;
          break;
        case "ArrowRight":
        case "KeyD":
          keysPressed.current.right = true;
          break;
        case "Escape":
          keysPressed.current.escape = true;
          break;
        case "Space":
          keysPressed.current.space = true;
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case "ArrowUp":
        case "KeyW":
          keysPressed.current.up = false;
          break;
        case "ArrowDown":
        case "KeyS":
          keysPressed.current.down = false;
          break;
        case "ArrowLeft":
        case "KeyA":
          keysPressed.current.left = false;
          break;
        case "ArrowRight":
        case "KeyD":
          keysPressed.current.right = false;
          break;
        case "Escape":
          keysPressed.current.escape = false;
          break;
        case "Space":
          keysPressed.current.space = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keysPressed.current;
};
