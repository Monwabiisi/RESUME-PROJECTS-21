"use client"

import { useState, useEffect, useCallback } from "react"

interface HighScoreEntry {
  name: string
  score: number
}

export function useHighScore(gameName: string) {
  const [highScore, setHighScore] = useState<HighScoreEntry | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedHighScore = localStorage.getItem(`highScore_${gameName}`)
      if (storedHighScore) {
        try {
          setHighScore(JSON.parse(storedHighScore))
        } catch (e) {
          console.error("Failed to parse high score from localStorage", e)
          localStorage.removeItem(`highScore_${gameName}`) // Clear corrupted data
        }
      }
    }
  }, [gameName])

  const updateHighScore = useCallback(
    (newScore: number, newName: string) => {
      if (typeof window !== "undefined") {
        const currentHighScore = highScore ? highScore.score : 0
        if (newScore > currentHighScore) {
          const newEntry: HighScoreEntry = { name: newName, score: newScore }
          localStorage.setItem(`highScore_${gameName}`, JSON.stringify(newEntry))
          setHighScore(newEntry)
          return true // Indicates a new high score was set
        }
      }
      return false // No new high score
    },
    [gameName, highScore],
  )

  return { highScore, updateHighScore }
}
