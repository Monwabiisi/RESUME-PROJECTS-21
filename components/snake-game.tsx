"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useHighScore } from "@/hooks/use-high-score" // Import the new hook
import HighScoreDialog from "@/components/high-score-dialog" // Import the new dialog

const GRID_SIZE = 20
const TILE_SIZE = 20 // pixels
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 5, y: 5 }
const INITIAL_DIRECTION = { x: 0, y: -1 } // Up
const GAME_SPEED = 150 // milliseconds

interface SnakeGameProps {
  onBack: () => void
}

export default function SnakeGame({ onBack }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [snake, setSnake] = useState(INITIAL_SNAKE)
  const [food, setFood] = useState(INITIAL_FOOD)
  const [direction, setDirection] = useState(INITIAL_DIRECTION)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const directionRef = useRef(direction) // Use ref to prevent stale closure

  const { highScore, updateHighScore } = useHighScore("snake") // Use the high score hook
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
    } while (snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y))
    setFood(newFood)
  }, [snake])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(INITIAL_FOOD)
    setDirection(INITIAL_DIRECTION)
    directionRef.current = INITIAL_DIRECTION
    setScore(0)
    setGameOver(false)
    setGameStarted(false)
    setShowHighScoreDialog(false) // Reset dialog state
    setIsNewHighScore(false) // Reset new high score flag
  }, [])

  const startGame = useCallback(() => {
    resetGame()
    setGameStarted(true)
  }, [resetGame])

  // Game loop and keyboard handling
  useEffect(() => {
    if (!gameStarted || gameOver) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentDir = directionRef.current
      switch (e.key) {
        case "ArrowUp":
          if (currentDir.y === 0) setDirection({ x: 0, y: -1 })
          break
        case "ArrowDown":
          if (currentDir.y === 0) setDirection({ x: 0, y: 1 })
          break
        case "ArrowLeft":
          if (currentDir.x === 0) setDirection({ x: -1, y: 0 })
          break
        case "ArrowRight":
          if (currentDir.x === 0) setDirection({ x: 1, y: 0 })
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        head.x += directionRef.current.x
        head.y += directionRef.current.y

        // Check for wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true)
          clearInterval(gameLoop)
          return prevSnake
        }

        // Check for self-collision
        if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true)
          clearInterval(gameLoop)
          return prevSnake
        }

        newSnake.unshift(head) // Add new head

        // Check for food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prevScore) => prevScore + 1)
          generateFood()
        } else {
          newSnake.pop() // Remove tail if no food eaten
        }

        return newSnake
      })
    }, GAME_SPEED)

    return () => {
      clearInterval(gameLoop)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameStarted, gameOver, food, generateFood])

  // Handle game over and high score
  useEffect(() => {
    if (gameOver && gameStarted) {
      const currentHighScoreValue = highScore ? highScore.score : 0
      const newHighScoreAchieved = score > currentHighScoreValue
      setIsNewHighScore(newHighScoreAchieved)
      setShowHighScoreDialog(true)
    }
  }, [gameOver, gameStarted, score, highScore]) // Added highScore to dependencies

  const handleSaveHighScore = useCallback(
    (name: string) => {
      updateHighScore(score, name)
    },
    [score, updateHighScore],
  )

  const handleCloseHighScoreDialog = useCallback(() => {
    setShowHighScoreDialog(false)
    // Optionally, reset game or go back to selection after dialog closes
    // resetGame(); // Or onBack();
  }, [])

  // Drawing logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw snake
    ctx.fillStyle = "#00ff00" // Green
    snake.forEach((segment) => {
      ctx.fillRect(segment.x * TILE_SIZE, segment.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
    })

    // Draw food
    ctx.fillStyle = "#ff0000" // Red
    ctx.fillRect(food.x * TILE_SIZE, food.y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
  }, [snake, food])

  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-gray-900 rounded-lg border-2 border-green-500 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      // Apply a subtle animation to the entire game container
      animate={{ scale: [1, 1.01, 1] }} // Using animate directly for continuous loop
      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
    >
      <h3 className="text-3xl font-bold text-green-400 pixel-font mb-4">SNAKE GAME</h3>
      <p className="text-lg text-white pixel-font mb-2">Score: {score}</p>
      {highScore && (
        <p className="text-md text-yellow-400 pixel-font mb-4">
          High Score: {highScore.score} by {highScore.name}
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="bg-gray-800 border-4 border-green-600 pixelated"
      />
      {!gameStarted && (
        <Button
          onClick={startGame}
          className="mt-6 bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 px-6 rounded-lg border-4 border-yellow-700 shadow-lg pixel-font text-lg"
        >
          START GAME
        </Button>
      )}
      {gameOver &&
        !showHighScoreDialog && ( // Only show "GAME OVER!" if dialog is not open
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
            <p className="text-2xl font-bold text-red-500 pixel-font">GAME OVER!</p>
            <Button
              onClick={startGame}
              className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-lg border-4 border-red-700 shadow-lg pixel-font text-lg"
            >
              PLAY AGAIN
            </Button>
          </motion.div>
        )}
      <Button
        onClick={onBack}
        className="mt-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-gray-800 shadow-md pixel-font text-md"
      >
        Back to Game Selection
      </Button>

      <HighScoreDialog
        isOpen={showHighScoreDialog}
        onClose={handleCloseHighScoreDialog}
        currentScore={score}
        gameName="snake"
        oldHighScore={highScore}
        onSave={handleSaveHighScore}
        isNewHighScore={isNewHighScore}
      />
    </motion.div>
  )
}
