import { createRoot } from 'react-dom/client'
import { GameProvider } from './contexts/GameContext'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(
  <GameProvider>
    <App />
  </GameProvider>
);