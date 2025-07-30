"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface HighScoreDialogProps {
  isOpen: boolean
  onClose: () => void
  currentScore: number
  gameName: string
  oldHighScore: { name: string; score: number } | null
  onSave: (name: string) => void
  isNewHighScore: boolean
}

export default function HighScoreDialog({
  isOpen,
  onClose,
  currentScore,
  gameName,
  oldHighScore,
  onSave,
  isNewHighScore,
}: HighScoreDialogProps) {
  const [playerName, setPlayerName] = useState("")

  useEffect(() => {
    if (isOpen) {
      setPlayerName("") // Reset name when dialog opens
    }
  }, [isOpen])

  const handleSave = () => {
    if (playerName.trim()) {
      onSave(playerName.trim())
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-green-500 border-2 pixel-font text-white">
        <DialogHeader>
          <DialogTitle className="text-green-400 text-2xl">Game Over!</DialogTitle>
          <DialogDescription className="text-gray-300">
            Your score: <span className="text-yellow-400">{currentScore}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isNewHighScore ? (
            <>
              <p className="text-xl text-yellow-400">NEW HIGH SCORE!</p>
              {oldHighScore && (
                <p className="text-sm text-gray-400">
                  Old High Score: {oldHighScore.score} by {oldHighScore.name}
                </p>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right text-gray-300">
                  Name
                </Label>
                <Input
                  id="name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="col-span-3 bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter your name"
                  maxLength={10} // Limit name length
                />
              </div>
            </>
          ) : (
            <p className="text-lg text-gray-300">
              {oldHighScore ? `High Score: ${oldHighScore.score} by ${oldHighScore.name}` : "No high score yet."}
            </p>
          )}
        </div>
        <DialogFooter>
          {isNewHighScore && (
            <Button
              type="submit"
              onClick={handleSave}
              disabled={!playerName.trim()}
              className="bg-green-600 hover:bg-green-500 text-white pixel-font"
            >
              Save High Score
            </Button>
          )}
          <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white pixel-font">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
