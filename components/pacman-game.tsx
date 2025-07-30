"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useHighScore } from "@/hooks/use-high-score" // Import the new hook
import HighScoreDialog from "@/components/high-score-dialog" // Import the new dialog

const GRID_SIZE = 21 // Standard Pac-Man grid is often 21x21 or 28x31
const TILE_SIZE = 20 // pixels
const CANVAS_SIZE_BASE = 420 // Base size for 21x21 grid (21 * 20)
const PACMAN_SPEED_NORMAL = 200 // milliseconds per move
const PACMAN_SPEED_BOOSTED = 100 // milliseconds per move (faster)
const GHOST_SPEED = 250 // milliseconds per move (slightly slower than Pac-Man)
const LASER_SPEED = 50 // milliseconds per move (very fast)
const SPEED_BOOST_DURATION = 5000 // 5 seconds
const GHOST_RESPAWN_DELAY = 3000 // 3 seconds

// Maze representation (1 = wall, 0 = path, 2 = dot, 3 = speed power-up, 4 = laser power-up)
const INITIAL_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1], // Ghost respawn area
  [1, 3, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 4, 2, 1], // Speed (3) and Laser (4) Power-ups
  [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
]

// Define dot types for clarity
const DOT_TYPES = {
  WALL: 1,
  DOT: 2,
  SPEED_POWERUP: 3,
  LASER_POWERUP: 4,
  EMPTY: 0,
}

const getInitialDots = (maze: number[][]) => {
  const dots: { x: number; y: number; type: number }[] = []
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (
        maze[y][x] === DOT_TYPES.DOT ||
        maze[y][x] === DOT_TYPES.SPEED_POWERUP ||
        maze[y][x] === DOT_TYPES.LASER_POWERUP
      ) {
        dots.push({ x, y, type: maze[y][x] })
      }
    }
  }
  return dots
}

interface PacmanGameProps {
  onBack: () => void
}

// Ghost type definition
interface Ghost {
  id: string
  x: number
  y: number
  color: string
  direction: { x: number; y: number }
  isKilled: boolean
  initialPos: { x: number; y: number }
}

// Laser type definition
interface Laser {
  id: string
  x: number
  y: number
  direction: { x: number; y: number }
}

export default function PacmanGame({ onBack }: PacmanGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [pacmanPos, setPacmanPos] = useState({ x: 1, y: 1 }) // Start in the top-left
  const [pacmanDirection, setPacmanDirection] = useState({ x: 0, y: 0 }) // 0,0 means stationary
  const [pacmanNextDirection, setPacmanNextDirection] = useState({ x: 0, y: 0 })
  const [score, setScore] = useState(0)
  const [dots, setDots] = useState(getInitialDots(INITIAL_MAZE))
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [maze, setMaze] = useState(INITIAL_MAZE.map((row) => [...row])) // Deep copy for mutable maze
  const [canvasSize, setCanvasSize] = useState(CANVAS_SIZE_BASE)

  // Ghost state (up to 4 ghosts)
  const [ghosts, setGhosts] = useState<Ghost[]>([
    {
      id: "blinky",
      x: 9,
      y: 9,
      color: "#FF0000",
      direction: { x: 0, y: -1 },
      isKilled: false,
      initialPos: { x: 9, y: 9 },
    },
    {
      id: "pinky",
      x: 11,
      y: 9,
      color: "#FFB8DE",
      direction: { x: 0, y: -1 },
      isKilled: false,
      initialPos: { x: 11, y: 9 },
    },
    {
      id: "inky",
      x: 9,
      y: 10,
      color: "#00FFFF",
      direction: { x: 0, y: 1 },
      isKilled: false,
      initialPos: { x: 9, y: 10 },
    },
    {
      id: "clyde",
      x: 11,
      y: 10,
      color: "#FFB851",
      direction: { x: 0, y: 1 },
      isKilled: false,
      initialPos: { x: 11, y: 10 },
    },
  ])

  // Power-up states
  const [isSpeedBoostActive, setIsSpeedBoostActive] = useState(false)
  const [laserCount, setLaserCount] = useState(0)
  const [lasers, setLasers] = useState<Laser[]>([])
  const [gameWon, setGameWon] = useState(false)

  const { highScore, updateHighScore } = useHighScore("pacman") // Use the high score hook
  const [showHighScoreDialog, setShowHighScoreDialog] = useState(false)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  // Sound effects
  const playSound = useCallback((type: "dot" | "powerUp" | "laser" | "ghostKill" | "gameOver" | "win") => {
    if (typeof window === "undefined") return
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    switch (type) {
      case "dot":
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05)
        break
      case "powerUp":
        oscillator.type = "triangle"
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2)
        break
      case "laser":
        oscillator.type = "sawtooth"
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1)
        break
      case "ghostKill":
        oscillator.type = "square"
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3)
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
        break
      case "gameOver":
        oscillator.type = "square"
        oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.5)
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
        break
      case "win":
        oscillator.type = "sine"
        oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
        oscillator.frequency.exponentialRampToValueAtTime(659, audioContext.currentTime + 0.1) // E5
        oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.2) // G5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3)
        break
    }

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.5)
  }, [])

  const resetGame = useCallback(() => {
    const newMaze = INITIAL_MAZE.map((row) => [...row])
    setMaze(newMaze)
    setPacmanPos({ x: 1, y: 1 })
    setPacmanDirection({ x: 0, y: 0 })
    setPacmanNextDirection({ x: 0, y: 0 })
    setScore(0)
    setDots(getInitialDots(newMaze))
    setGameOver(false)
    setGameWon(false)
    setGameStarted(false)
    setGhosts([
      {
        id: "blinky",
        x: 9,
        y: 9,
        color: "#FF0000",
        direction: { x: 0, y: -1 },
        isKilled: false,
        initialPos: { x: 9, y: 9 },
      },
      {
        id: "pinky",
        x: 11,
        y: 9,
        color: "#FFB8DE",
        direction: { x: 0, y: -1 },
        isKilled: false,
        initialPos: { x: 11, y: 9 },
      },
      {
        id: "inky",
        x: 9,
        y: 10,
        color: "#00FFFF",
        direction: { x: 0, y: 1 },
        isKilled: false,
        initialPos: { x: 9, y: 10 },
      },
      {
        id: "clyde",
        x: 11,
        y: 10,
        color: "#FFB851",
        direction: { x: 0, y: 1 },
        isKilled: false,
        initialPos: { x: 11, y: 10 },
      },
    ])
    setIsSpeedBoostActive(false)
    setLaserCount(0)
    setLasers([])
    setShowHighScoreDialog(false) // Reset dialog state
    setIsNewHighScore(false) // Reset new high score flag
  }, [])

  const startGame = useCallback(() => {
    resetGame()
    setGameStarted(true)
    setPacmanDirection({ x: 1, y: 0 }) // Start Pac-Man moving right
  }, [resetGame])

  // Handle canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const newSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.7, CANVAS_SIZE_BASE)
      setCanvasSize(Math.floor(newSize / TILE_SIZE) * TILE_SIZE) // Ensure it's a multiple of TILE_SIZE
    }

    window.addEventListener("resize", handleResize)
    handleResize() // Set initial size

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Pac-Man Movement Logic
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return

    const handleKeyDown = (e: KeyboardEvent) => {
      let newDir = { x: 0, y: 0 }
      switch (e.key) {
        case "ArrowUp":
          newDir = { x: 0, y: -1 }
          break
        case "ArrowDown":
          newDir = { x: 0, y: 1 }
          break
        case "ArrowLeft":
          newDir = { x: -1, y: 0 }
          break
        case "ArrowRight":
          newDir = { x: 1, y: 0 }
          break
        case " ": // Spacebar for laser
          if (laserCount > 0 && (pacmanDirection.x !== 0 || pacmanDirection.y !== 0)) {
            // Only shoot if moving
            playSound("laser")
            setLaserCount((prev) => prev - 1)
            setLasers((prevLasers) => [
              ...prevLasers,
              {
                id: Date.now().toString(), // Unique ID for laser
                x: pacmanPos.x,
                y: pacmanPos.y,
                direction: { ...pacmanDirection }, // Laser shoots in current Pac-Man direction
              },
            ])
          }
          return
        default:
          return
      }
      setPacmanNextDirection(newDir)
    }

    window.addEventListener("keydown", handleKeyDown)

    const pacmanLoop = setInterval(
      () => {
        setPacmanPos((prevPos) => {
          let currentDir = pacmanDirection

          // Try to apply nextDirection if valid
          const nextX = prevPos.x + pacmanNextDirection.x
          const nextY = prevPos.y + pacmanNextDirection.y
          const newY = prevPos.y + pacmanNextDirection.y // Declare newY here

          if (
            pacmanNextDirection.x !== 0 ||
            pacmanNextDirection.y !== 0 // Only try if a new direction was actually pressed
          ) {
            if (
              nextX >= 0 &&
              nextX < GRID_SIZE &&
              nextY >= 0 &&
              nextY < GRID_SIZE &&
              maze[newY][nextX] !== DOT_TYPES.WALL
            ) {
              currentDir = pacmanNextDirection
              setPacmanDirection(pacmanNextDirection)
              setPacmanNextDirection({ x: 0, y: 0 }) // Clear next direction after applying
            }
          }

          const newX = prevPos.x + currentDir.x
          // const newY = prevPos.y + currentDir.y // newY is already declared above

          // Check for wall collision with current direction
          if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE || maze[newY][newX] === DOT_TYPES.WALL) {
            // If hit wall, stop Pac-Man
            setPacmanDirection({ x: 0, y: 0 })
            return prevPos
          }

          // Eat dot or power-up
          const cellContent = maze[newY][newX]
          if (cellContent !== DOT_TYPES.EMPTY) {
            setMaze((prevMaze) => {
              const updatedMaze = prevMaze.map((row) => [...row])
              updatedMaze[newY][newX] = DOT_TYPES.EMPTY // Mark as empty
              return updatedMaze
            })
            setDots((prevDots) => {
              const remainingDots = prevDots.filter((dot) => !(dot.x === newX && dot.y === newY))
              if (remainingDots.length === 0) {
                setGameWon(true)
                setGameOver(true) // End game on win
                playSound("win")
              }
              return remainingDots
            })

            if (cellContent === DOT_TYPES.DOT) {
              setScore((s) => s + 1)
              playSound("dot")
            } else if (cellContent === DOT_TYPES.SPEED_POWERUP) {
              setIsSpeedBoostActive(true)
              playSound("powerUp")
              setTimeout(() => setIsSpeedBoostActive(false), SPEED_BOOST_DURATION)
            } else if (cellContent === DOT_TYPES.LASER_POWERUP) {
              setLaserCount((prev) => Math.min(2, prev + 1)) // Max 2 lasers
              playSound("powerUp")
            }
          }

          return { x: newX, y: newY }
        })
      },
      isSpeedBoostActive ? PACMAN_SPEED_BOOSTED : PACMAN_SPEED_NORMAL,
    )

    return () => {
      clearInterval(pacmanLoop)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [
    gameStarted,
    gameOver,
    gameWon,
    pacmanDirection,
    pacmanNextDirection,
    maze,
    isSpeedBoostActive,
    laserCount,
    pacmanPos,
    dots.length,
    playSound,
  ])

  // Ghost Movement Logic
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return

    const ghostLoop = setInterval(() => {
      setGhosts((prevGhosts) => {
        return prevGhosts.map((ghost) => {
          if (ghost.isKilled) return ghost // Don't move killed ghosts

          const possibleMoves = [
            { x: 0, y: -1 }, // Up
            { x: 0, y: 1 }, // Down
            { x: -1, y: 0 }, // Left
            { x: 1, y: 0 }, // Right
          ]

          // Filter out moves that lead into a wall
          const validMoves = possibleMoves.filter((dir) => {
            const newX = ghost.x + dir.x
            const newY = ghost.y + dir.y
            return newX >= 0 && newX < GRID_SIZE && newY >= 0 && newY < GRID_SIZE && maze[newY][newX] !== DOT_TYPES.WALL
          })

          let nextDirection = ghost.direction

          // Introduce randomness for ghost movement (e.g., 20% chance to pick a random valid direction)
          if (Math.random() < 0.2 && validMoves.length > 0) {
            nextDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
          } else {
            // Simple chase AI: try to move closer to Pac-Man
            let minDistance = Number.POSITIVE_INFINITY
            let bestChaseMove = ghost.direction

            validMoves.forEach((dir) => {
              const newX = ghost.x + dir.x
              const newY = ghost.y + dir.y
              const distance = Math.abs(pacmanPos.x - newX) + Math.abs(pacmanPos.y - newY) // Manhattan distance

              // Prioritize moves that reduce distance, and avoid reversing unless necessary
              if (
                distance < minDistance &&
                !(dir.x === -ghost.direction.x && dir.y === -ghost.direction.y) // Avoid 180-degree turns
              ) {
                minDistance = distance
                bestChaseMove = dir
              }
            })
            nextDirection = bestChaseMove
          }

          const newX = ghost.x + nextDirection.x
          const newY = ghost.y + nextDirection.y

          // If the chosen move is into a wall, try to find another valid move
          if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE || maze[newY][newX] === DOT_TYPES.WALL) {
            if (validMoves.length > 0) {
              nextDirection = validMoves[Math.floor(Math.random() * validMoves.length)]
            } else {
              nextDirection = { x: 0, y: 0 } // Stay put if no valid moves
            }
          }

          return { ...ghost, x: ghost.x + nextDirection.x, y: ghost.y + nextDirection.y, direction: nextDirection }
        })
      })
    }, GHOST_SPEED)

    return () => clearInterval(ghostLoop)
  }, [gameStarted, gameOver, gameWon, maze, pacmanPos])

  // Laser Movement Logic
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return

    const laserLoop = setInterval(() => {
      setLasers((prevLasers) => {
        const updatedLasers: Laser[] = []
        prevLasers.forEach((laser) => {
          const newX = laser.x + laser.direction.x
          const newY = laser.y + laser.direction.y

          // Check for wall collision
          if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE || maze[newY][newX] === DOT_TYPES.WALL) {
            // Laser hits wall, remove it
            return
          }

          // Check for ghost collision
          let hitGhost = false
          setGhosts((prevGhosts) => {
            return prevGhosts.map((ghost) => {
              if (!ghost.isKilled && newX === ghost.x && newY === ghost.y) {
                hitGhost = true
                playSound("ghostKill")
                // Ghost is hit, mark as killed and schedule respawn
                setTimeout(() => {
                  setGhosts((currentGhosts) =>
                    currentGhosts.map((g) =>
                      g.id === ghost.id ? { ...g, x: g.initialPos.x, y: g.initialPos.y, isKilled: false } : g,
                    ),
                  )
                }, GHOST_RESPAWN_DELAY)
                return { ...ghost, isKilled: true } // Mark ghost as killed
              }
              return ghost
            })
          })

          if (!hitGhost) {
            updatedLasers.push({ ...laser, x: newX, y: newY })
          }
        })
        return updatedLasers
      })
    }, LASER_SPEED)

    return () => clearInterval(laserLoop)
  }, [gameStarted, gameOver, gameWon, maze, playSound])

  // Collision Detection (Pac-Man vs. Ghosts)
  useEffect(() => {
    if (!gameStarted || gameOver || gameWon) return

    ghosts.forEach((ghost) => {
      if (!ghost.isKilled && pacmanPos.x === ghost.x && pacmanPos.y === ghost.y) {
        setGameOver(true)
        playSound("gameOver")
      }
    })
  }, [pacmanPos, ghosts, gameStarted, gameOver, gameWon, playSound])

  // Handle game over/win and high score
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

  // Drawing Logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // Draw maze walls
    ctx.fillStyle = "#0000FF" // Blue walls
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (maze[y][x] === DOT_TYPES.WALL) {
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        }
      }
    }

    // Draw dots and power-ups
    dots.forEach((dot) => {
      if (maze[dot.y][dot.x] === DOT_TYPES.DOT) {
        ctx.fillStyle = "#FFD700" // Gold dots
        ctx.beginPath()
        ctx.arc(dot.x * TILE_SIZE + TILE_SIZE / 2, dot.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 6, 0, Math.PI * 2)
        ctx.fill()
      } else if (maze[dot.y][dot.x] === DOT_TYPES.SPEED_POWERUP) {
        ctx.fillStyle = "#00FF00" // Green for speed
        ctx.beginPath()
        ctx.arc(dot.x * TILE_SIZE + TILE_SIZE / 2, dot.y * TILE_SIZE + TILE_SIZE / 2, TILE_SIZE / 3, 0, Math.PI * 2)
        ctx.fill()
      } else if (maze[dot.y][dot.x] === DOT_TYPES.LASER_POWERUP) {
        ctx.fillStyle = "#FF00FF" // Magenta for laser
        ctx.beginPath()
        ctx.rect(dot.x * TILE_SIZE + TILE_SIZE / 4, dot.y * TILE_SIZE + TILE_SIZE / 4, TILE_SIZE / 2, TILE_SIZE / 2)
        ctx.fill()
      }
    })

    // Draw Pac-Man
    ctx.fillStyle = "#FFFF00" // Yellow Pac-Man
    ctx.beginPath()
    const angle = Math.atan2(pacmanDirection.y, pacmanDirection.x)
    const mouthOpen = gameStarted && (pacmanDirection.x !== 0 || pacmanDirection.y !== 0) ? Math.PI / 8 : 0
    ctx.arc(
      pacmanPos.x * TILE_SIZE + TILE_SIZE / 2,
      pacmanPos.y * TILE_SIZE + TILE_SIZE / 2,
      TILE_SIZE / 2 - 2,
      angle + mouthOpen,
      angle + Math.PI * 2 - mouthOpen,
    )
    ctx.lineTo(pacmanPos.x * TILE_SIZE + TILE_SIZE / 2, pacmanPos.y * TILE_SIZE + TILE_SIZE / 2)
    ctx.fill()

    // Draw Ghosts
    ghosts.forEach((ghost) => {
      if (ghost.isKilled) return // Don't draw killed ghosts

      ctx.fillStyle = ghost.color
      ctx.beginPath()
      // Ghost body (rectangle with rounded top corners)
      ctx.moveTo(ghost.x * TILE_SIZE, ghost.y * TILE_SIZE + TILE_SIZE / 2)
      ctx.lineTo(ghost.x * TILE_SIZE, ghost.y * TILE_SIZE + TILE_SIZE - 2)
      ctx.lineTo(ghost.x * TILE_SIZE + TILE_SIZE, ghost.y * TILE_SIZE + TILE_SIZE - 2)
      ctx.lineTo(ghost.x * TILE_SIZE + TILE_SIZE, ghost.y * TILE_SIZE + TILE_SIZE / 2)
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE / 2,
        ghost.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2,
        Math.PI,
        0,
        false,
      )
      ctx.closePath()
      ctx.fill()

      // Ghost eyes (simple circles)
      ctx.fillStyle = "white"
      ctx.beginPath()
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE * 0.3,
        ghost.y * TILE_SIZE + TILE_SIZE * 0.4,
        TILE_SIZE * 0.15,
        0,
        Math.PI * 2,
      )
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE * 0.7,
        ghost.y * TILE_SIZE + TILE_SIZE * 0.4,
        TILE_SIZE * 0.15,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      ctx.fillStyle = "blue"
      ctx.beginPath()
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE * 0.3 + ghost.direction.x * TILE_SIZE * 0.05,
        ghost.y * TILE_SIZE + TILE_SIZE * 0.4 + ghost.direction.y * TILE_SIZE * 0.05,
        TILE_SIZE * 0.08,
        0,
        Math.PI * 2,
      )
      ctx.arc(
        ghost.x * TILE_SIZE + TILE_SIZE * 0.7 + ghost.direction.x * TILE_SIZE * 0.05,
        ghost.y * TILE_SIZE + TILE_SIZE * 0.4 + ghost.direction.y * TILE_SIZE * 0.05,
        TILE_SIZE * 0.08,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    })

    // Draw Lasers
    lasers.forEach((laser) => {
      ctx.fillStyle = "#FF0000" // Red laser
      ctx.fillRect(
        laser.x * TILE_SIZE + TILE_SIZE / 4,
        laser.y * TILE_SIZE + TILE_SIZE / 4,
        TILE_SIZE / 2,
        TILE_SIZE / 2,
      )
    })
  }, [pacmanPos, dots, maze, pacmanDirection, gameStarted, ghosts, lasers, canvasSize])

  return (
    <motion.div
      className="flex flex-col items-center p-6 bg-gray-900 rounded-lg border-2 border-blue-500 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-3xl font-bold text-blue-400 pixel-font mb-4">PAC-MAN (Simplified)</h3>
      <div className="flex justify-between w-full max-w-md mb-4 text-lg text-white pixel-font">
        <span>Score: {score}</span>
        <span>Lasers: {laserCount}</span>
        {isSpeedBoostActive && <span className="text-green-400">SPEED BOOST!</span>}
      </div>
      {highScore && (
        <p className="text-md text-yellow-400 pixel-font mb-4">
          High Score: {highScore.score} by {highScore.name}
        </p>
      )}
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="bg-black border-4 border-blue-600 pixelated"
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
        !showHighScoreDialog && ( // Only show game over/win if dialog is not open
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
            <p className="text-2xl font-bold text-red-500 pixel-font">{gameWon ? "YOU WIN!" : "GAME OVER!"}</p>
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
        gameName="pacman"
        oldHighScore={highScore}
        onSave={handleSaveHighScore}
        isNewHighScore={isNewHighScore}
      />
    </motion.div>
  )
}
