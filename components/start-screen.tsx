"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

interface StartScreenProps {
  onPlayClick: () => void
}

export default function StartScreen({ onPlayClick }: StartScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const binary = "01"
    const fontSize = 16
    const columns = canvas.width / fontSize
    const drops: number[] = []

    // Initialize drops
    for (let i = 0; i < columns; i++) {
      drops[i] = 1
    }

    const draw = () => {
      ctx.fillStyle = "rgba(30, 58, 138, 0.05)" // Blue overlay to match gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = "#00ff80"
      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const text = binary[Math.floor(Math.random() * binary.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i]++
      }
    }

    const interval = setInterval(draw, 80)

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      clearInterval(interval)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center relative overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Binary Rain Background */}
      <canvas ref={canvasRef} className="absolute inset-0 opacity-30" style={{ zIndex: 1 }} />

      {/* 3D-looking Pixel clouds background */}
      <div className="absolute inset-0" style={{ zIndex: 2 }}>
        {/* Cloud 1 - Multi-layered for 3D effect */}
        <div className="absolute top-20 left-10">
          <div className="absolute w-24 h-16 bg-white rounded-full opacity-90 pixelated shadow-lg"></div>
          <div className="absolute w-20 h-12 bg-gray-100 rounded-full opacity-70 pixelated top-1 left-1"></div>
          <div className="absolute w-16 h-10 bg-gray-200 rounded-full opacity-50 pixelated top-2 left-2"></div>
          <div className="absolute w-8 h-6 bg-white rounded-full opacity-95 pixelated top-2 left-4"></div>
          <div className="absolute w-6 h-4 bg-white rounded-full opacity-85 pixelated top-3 right-2"></div>
        </div>

        {/* Cloud 2 - Multi-layered for 3D effect */}
        <div className="absolute top-32 right-20">
          <div className="absolute w-32 h-20 bg-white rounded-full opacity-85 pixelated shadow-lg"></div>
          <div className="absolute w-28 h-16 bg-gray-100 rounded-full opacity-65 pixelated top-1 left-1"></div>
          <div className="absolute w-24 h-14 bg-gray-200 rounded-full opacity-45 pixelated top-2 left-2"></div>
          <div className="absolute w-10 h-8 bg-white rounded-full opacity-90 pixelated top-2 left-6"></div>
          <div className="absolute w-8 h-6 bg-white rounded-full opacity-80 pixelated top-3 right-4"></div>
        </div>

        {/* Cloud 3 - Multi-layered for 3D effect */}
        <div className="absolute top-40 left-1/3">
          <div className="absolute w-28 h-18 bg-white rounded-full opacity-80 pixelated shadow-lg"></div>
          <div className="absolute w-24 h-14 bg-gray-100 rounded-full opacity-60 pixelated top-1 left-1"></div>
          <div className="absolute w-20 h-12 bg-gray-200 rounded-full opacity-40 pixelated top-2 left-2"></div>
          <div className="absolute w-9 h-7 bg-white rounded-full opacity-85 pixelated top-2 left-5"></div>
          <div className="absolute w-7 h-5 bg-white rounded-full opacity-75 pixelated top-3 right-3"></div>
        </div>

        {/* Cloud 4 - Multi-layered for 3D effect */}
        <div className="absolute bottom-40 right-10">
          <div className="absolute w-36 h-24 bg-white rounded-full opacity-75 pixelated shadow-lg"></div>
          <div className="absolute w-32 h-20 bg-gray-100 rounded-full opacity-55 pixelated top-1 left-1"></div>
          <div className="absolute w-28 h-18 bg-gray-200 rounded-full opacity-35 pixelated top-2 left-2"></div>
          <div className="absolute w-12 h-10 bg-white rounded-full opacity-80 pixelated top-2 left-8"></div>
          <div className="absolute w-10 h-8 bg-white rounded-full opacity-70 pixelated top-3 right-6"></div>
        </div>
      </div>

      {/* Monwabisi Ndlovu - Top Left */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white pixel-font text-shadow-lg absolute top-4 left-4 sm:top-8 sm:left-8 z-20 text-left"
        animate={{
          textShadow: ["2px 2px 0px #000", "2px 2px 0px #333", "2px 2px 0px #000"],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        MONWABISI NDLOVU
      </motion.h1>

      {/* Main content */}
      <motion.div
        className="text-center z-10 relative flex flex-col items-center justify-center h-full w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 10 }}
      >
        {/* PLAY Button - Centered and 3x Bigger */}
        <motion.button
          onClick={onPlayClick}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-6 px-16 rounded-lg border-4 border-red-700 shadow-lg pixel-font text-3xl transition-all duration-200 transform hover:scale-105 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:py-8 sm:px-24 sm:text-4xl"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: ["0 4px 0 #991b1b", "0 6px 0 #991b1b", "0 4px 0 #991b1b"],
          }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 2.8 }}
        >
          ▶ PLAY
        </motion.button>
      </motion.div>

      {/* PORTFOLIO - Bottom Left */}
      <motion.h1
        className="text-3xl sm:text-4xl md:text-5xl font-bold text-white pixel-font text-shadow-lg absolute bottom-4 left-4 sm:bottom-8 sm:left-8 z-20 text-left"
        animate={{
          textShadow: ["2px 2px 0px #000", "2px 2px 0px #333", "2px 2px 0px #000"],
        }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        PORTFOLIO
      </motion.h1>

      {/* Decorative elements */}
      <motion.div
        className="absolute bottom-10 left-10 w-16 h-16 bg-yellow-400 rounded-full"
        animate={{
          rotate: 360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
          scale: { duration: 2, repeat: Number.POSITIVE_INFINITY },
        }}
        style={{ zIndex: 5 }}
      />

      <motion.div
        className="absolute top-10 right-10 w-16 h-16"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        style={{ zIndex: 5 }}
      >
        {/* Pokéball Base */}
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl">
          {/* Top Red Half */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-br from-red-400 via-red-500 to-red-700 rounded-t-full"></div>

          {/* Bottom White Half */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-br from-gray-100 via-white to-gray-200 rounded-b-full"></div>

          {/* Black Band */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-gray-800 via-black to-gray-800 transform -translate-y-1/2"></div>

          {/* Center Button Outer Ring */}
          <div className="absolute top-1/2 left-1/2 w-6 h-6 bg-gradient-to-br from-gray-200 via-white to-gray-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-inner"></div>

          {/* Center Button Inner Circle */}
          <div className="absolute top-1/2 left-1/2 w-4 h-4 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* Center Button Highlight */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-gradient-to-br from-red-400 to-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>

          {/* 3D Highlight on top */}
          <div className="absolute top-2 left-3 w-3 h-3 bg-white opacity-40 rounded-full blur-sm"></div>

          {/* 3D Shadow on bottom */}
          <div className="absolute bottom-1 right-2 w-4 h-2 bg-black opacity-20 rounded-full blur-sm"></div>
        </div>
      </motion.div>

      {/* Additional Matrix-style effects */}
      <motion.div
        className="absolute left-1/4 top-1/4 text-green-400 font-mono text-xs opacity-60"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        style={{ zIndex: 3 }}
      >
        <div>01001000 01100101 01101100</div>
        <div>01101100 01101111 00100000</div>
        <div>01010111 01101111 01110010</div>
        <div>01101100 01100100 00100001</div>
      </motion.div>

      <motion.div
        className="absolute right-1/4 bottom-1/4 text-green-400 font-mono text-xs opacity-60"
        animate={{ opacity: [0.8, 0.3, 0.8] }}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        style={{ zIndex: 3 }}
      >
        <div>01001101 01101111 01101110</div>
        <div>01110111 01100001 01100010</div>
        <div>01101001 01110011 01101001</div>
      </motion.div>
    </div>
  )
}
