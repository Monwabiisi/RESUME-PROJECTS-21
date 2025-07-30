"use client"

import { useState, useEffect } from "react"
import StartScreen from "@/components/start-screen"
import LoadingScreen from "@/components/loading-screen"
import PortfolioGlobe from "@/components/portfolio-globe"
import { AnimatePresence, motion } from "framer-motion"

export default function Home() {
  const [currentStage, setCurrentStage] = useState<"start" | "loading" | "portfolio">("start")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMouseActive, setIsMouseActive] = useState(false)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY })
      setIsMouseActive(true)
    }

    const handleMouseLeave = () => {
      setIsMouseActive(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave) // Detects leaving browser window

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const handlePlayClick = () => {
    setCurrentStage("loading")
  }

  const handleLoadingComplete = () => {
    setCurrentStage("portfolio")
  }

  return (
    <div className="min-h-screen relative">
      <AnimatePresence mode="wait">
        {currentStage === "start" && (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <StartScreen onPlayClick={handlePlayClick} />
          </motion.div>
        )}
        {currentStage === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingScreen onComplete={handleLoadingComplete} />
          </motion.div>
        )}
        {currentStage === "portfolio" && (
          <motion.div key="portfolio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <PortfolioGlobe />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Arceus Cursor */}
      <AnimatePresence>
        {isMouseActive && (
          <motion.img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png" // Arceus sprite
            alt="Arceus cursor"
            className="fixed w-12 h-12 pixelated z-[9999] pointer-events-none" // High z-index, non-blocking
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              x: mousePosition.x + 10, // Offset slightly from actual cursor
              y: mousePosition.y + 10,
            }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{
              opacity: { duration: 0.05 }, // Very fast fade in/out
              scale: { duration: 0.05 },
              x: { duration: 0.05, ease: "linear" }, // Fast follow
              y: { duration: 0.05, ease: "linear" },
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
