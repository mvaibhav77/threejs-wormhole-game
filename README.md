# 🌌 Three.js Wormhole Game

A fast-paced 3D tunnel navigation game built with React Three Fiber and TypeScript.

## 🎮 What is this?

Navigate through an infinite wormhole tunnel while avoiding obstacles. The game features progressive difficulty with increasing obstacle density as you survive longer.

**Live Demo:** [https://threejs-wormhole-game.vercel.app/](https://threejs-wormhole-game.vercel.app/)

## 🎯 Game Features

- **Smooth 3D tunnel navigation** with React Three Fiber
- **Progressive difficulty** - obstacles increase every 15 seconds
- **Collision detection** with visual feedback
- **Score tracking** and high score persistence
- **Pause/resume** functionality
- **Responsive controls** (WASD/Arrow keys)

## 🚀 Tech Stack

- **React** with TypeScript
- **React Three Fiber** for 3D rendering
- **Zustand** for state management
- **Vite** for development and build
- **Three.js** for 3D graphics

## 🎥 Inspiration

Inspired by **Bobby Roe's** Three.js tutorials and examples.

- **Creator:** [Bobby Roe](https://github.com/bobbyroe)
- **Reference:** Three.js tutorial series

## 🎮 Controls

- **WASD** or **Arrow Keys** - Navigate
- **ESC** - Pause/Resume
- **R** - Restart (when game over)
- **Q** - Quit to menu

## 🛠 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

Clean, modular architecture with separated concerns:

- `src/components/3dComponents/` - 3D rendering components
- `src/hooks/` - Custom game logic hooks
- `src/store/` - Zustand state management
- `src/types/` - TypeScript definitions

---

Built with ❤️ using React Three Fiber
