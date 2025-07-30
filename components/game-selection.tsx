"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import SnakeGame from "./snake-game"
import PacmanGame from "./pacman-game"

export default function GameSelection() {
  const [selectedGame, setSelectedGame] = useState<"none" | "snake" | "pacman">("none")

  const handleSelectGame = (game: "snake" | "pacman") => {
    setSelectedGame(game)
  }

  const handleBackToSelection = () => {
    setSelectedGame("none")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <AnimatePresence mode="wait">
        {selectedGame === "none" && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h3 className="text-4xl font-bold text-yellow-400 pixel-font mb-8">CHOOSE YOUR GAME</h3>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button
                onClick={() => handleSelectGame("snake")}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-green-700 shadow-lg pixel-font text-xl transition-all duration-200 transform hover:scale-105"
              >
                Play Snake
              </Button>
              <Button
                onClick={() => handleSelectGame("pacman")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-lg border-4 border-blue-700 shadow-lg pixel-font text-xl transition-all duration-200 transform hover:scale-105"
              >
                Play Pac-Man
              </Button>
            </div>
          </motion.div>
        )}

        {selectedGame === "snake" && (
          <motion.div
            key="snake"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <SnakeGame onBack={handleBackToSelection} />
          </motion.div>
        )}

        {selectedGame === "pacman" && (
          <motion.div
            key="pacman"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <PacmanGame onBack={handleBackToSelection} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
