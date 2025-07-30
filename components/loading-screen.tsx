"use client"

import { useState, useEffect, useRef, Suspense, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Sphere } from "@react-three/drei" // Import Cloud component
import * as THREE from "three"

interface LoadingScreenProps {
  onComplete: () => void
}

// 3D Pokéball Component
function Pokeball3D({ progress, isOpen }: { progress: number; isOpen: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const topHalfRef = useRef<THREE.Mesh>(null)
  const bottomHalfRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()
  // Add a ref to keep track of rotation
  const rotationRef = useRef(0)

  useFrame(() => {
    if (groupRef.current) {
      // Smoothly rotate the Pokeball
      rotationRef.current += 0.01
      groupRef.current.rotation.y = rotationRef.current
      groupRef.current.rotation.x = Math.sin(Date.now() * 0.001) * 0.05
    }

    // Animate opening/closing
    if (topHalfRef.current && bottomHalfRef.current) {
      const targetY = isOpen ? 0.2 : 0 // Distance to open
      topHalfRef.current.position.y = THREE.MathUtils.lerp(topHalfRef.current.position.y, targetY, 0.05)
      bottomHalfRef.current.position.y = THREE.MathUtils.lerp(bottomHalfRef.current.position.y, -targetY, 0.05)
    }

    if (ringRef.current) {
      // Update progress ring
      ringRef.current.geometry.dispose()
      ringRef.current.geometry = new THREE.RingGeometry(0.65, 0.7, 64, 1, 0, (progress / 100) * Math.PI * 2) // Adjusted size
      ringRef.current.rotation.z = Math.PI / 2 // Align to start from top
    }
    // Ensure camera is always looking at the center of the pokeball
    camera.lookAt(0, 0, 0)
  })

  const POKEBALL_RADIUS = 0.6 // Increased size

  return (
    <group ref={groupRef}>
      {/* Top Red Half */}
      <mesh ref={topHalfRef} position={[0, 0, 0]}>
        <sphereGeometry args={[POKEBALL_RADIUS, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#FF0000" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Bottom White Half */}
      <mesh ref={bottomHalfRef} position={[0, 0, 0]}>
        <sphereGeometry args={[POKEBALL_RADIUS, 32, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Black Band */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[POKEBALL_RADIUS + 0.01, POKEBALL_RADIUS + 0.01, 0.08, 64]} />
        <meshStandardMaterial color="#333333" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Center Button Outer Ring (White) */}
      <mesh position={[0, 0, 0.04]}>
        <ringGeometry args={[0.18, 0.22, 64]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} metalness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Center Button Inner Circle (Dark Gray) */}
      <Sphere args={[0.17, 32, 32]} position={[0, 0, 0.045]}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </Sphere>
      {/* Center Button Red Dot */}
      <Sphere args={[0.06, 32, 32]} position={[0, 0, 0.05]}>
        <meshStandardMaterial color="#FF0000" roughness={0.3} metalness={0.1} />
      </Sphere>

      {/* Progress Ring */}
      <mesh ref={ringRef} rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[0.65, 0.7, 64, 1, 0, (progress / 100) * Math.PI * 2]} />
        <meshBasicMaterial color="#00ff80" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// HealthBar Component
const HealthBar = ({ health }: { health: number }) => (
  <div className="w-24 h-4 bg-gray-700 border-2 border-black rounded-sm overflow-hidden">
    <div
      className="h-full bg-green-500 transition-all duration-300 ease-out"
      style={{ width: `${Math.max(0, health)}%` }}
    ></div>
  </div>
)

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [battlePhase, setBattlePhase] = useState<"fighting" | "victory" | "complete">("fighting")
  const [currentAttack, setCurrentAttack] = useState<"pikachu" | "mewtwo" | "none">("none")
  const [showImpact, setShowImpact] = useState(false)
  const [pikachuCry, setPikachuCry] = useState(false)
  const [pokeballOpen, setPokeballOpen] = useState(false) // New state for pokeball opening
  const [mewtwoCaptured, setMewtwoCaptured] = useState(false) // New state for Mewtwo capture animation

  const [pikachuHealth, setPikachuHealth] = useState(100)
  const [mewtwoHealth, setMewtwoHealth] = useState(100)

  const animationFrameRef = useRef<number>()
  const startTimeRef = useRef<number>(0)
  const battleEventsRef = useRef<Array<{ time: number; attacker: "pikachu" | "mewtwo"; damage: number; hit: boolean }>>(
    [
      { time: 1000, attacker: "pikachu", damage: 25, hit: false }, // Pikachu hits Mewtwo
      { time: 2500, attacker: "mewtwo", damage: 10, hit: false }, // Mewtwo hits Pikachu
      { time: 4000, attacker: "pikachu", damage: 25, hit: false }, // Pikachu hits Mewtwo
      { time: 5500, attacker: "mewtwo", damage: 10, hit: false }, // Mewtwo hits Pikachu
      { time: 7000, attacker: "pikachu", damage: 25, hit: false }, // Pikachu hits Mewtwo
      { time: 8500, attacker: "mewtwo", damage: 10, hit: false }, // Mewtwo hits Pikachu
      { time: 10000, attacker: "pikachu", damage: 25, hit: false }, // Pikachu hits Mewtwo (Mewtwo's health should be 0 here)
    ],
  )

  const totalBattleDuration = battleEventsRef.current[battleEventsRef.current.length - 1].time + 1000 // Last hit + 1 sec for victory animation

  // Sound effects
  const playSound = useCallback(
    (type: "attack" | "hit" | "victory" | "transition" | "pikachuCry" | "crash" | "capture") => {
      if (typeof window === "undefined") return
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      switch (type) {
        case "attack":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
          break
        case "hit":
          oscillator.type = "square"
          oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.2)
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
          break
        case "victory":
          oscillator.type = "triangle"
          oscillator.frequency.setValueAtTime(523, audioContext.currentTime) // C5
          oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1) // E5
          oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2) // G5
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
          break
        case "transition":
          oscillator.type = "sawtooth"
          oscillator.frequency.setValueAtTime(100, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(500, audioContext.currentTime + 0.5)
          gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          break
        case "pikachuCry":
          oscillator.type = "square"
          oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5
          oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.1) // E6
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2) // A5
          oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.4) // A6
          gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          break
        case "crash":
          oscillator.type = "noise" as OscillatorType // Custom type for noise
          const bufferSize = audioContext.sampleRate * 0.5 // 0.5 seconds of noise
          const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
          const output = buffer.getChannelData(0)
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1
          }
          const source = audioContext.createBufferSource()
          source.buffer = buffer
          source.connect(gainNode)
          gainNode.gain.setValueAtTime(0.6, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5)
          source.start()
          source.stop(audioContext.currentTime + 0.5)
          return // Don't start oscillator for noise
        case "capture":
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(440, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.3)
          gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
          break
      }

      oscillator.start()
      oscillator.stop(audioContext.currentTime + 0.5)
    },
    [],
  ) // useCallback with empty dependency array for playSound

  useEffect(() => {
    if (battlePhase === "complete" || battlePhase === "victory") return

    const animate = (currentTime: DOMHighResTimeStamp) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime
      const elapsedTime = currentTime - startTimeRef.current

      // Update progress bar based on elapsed time, but cap at 100% if Mewtwo is defeated
      setProgress(Math.min(100, (elapsedTime / totalBattleDuration) * 100))

      // Process battle events
      battleEventsRef.current.forEach((event) => {
        if (!event.hit && elapsedTime >= event.time) {
          event.hit = true // Mark as hit to prevent re-triggering

          if (event.attacker === "pikachu") {
            setCurrentAttack("pikachu")
            playSound("attack")
            setTimeout(() => {
              setShowImpact(true)
              playSound("hit")
              setMewtwoHealth((prev) => Math.max(0, prev - event.damage)) // Pikachu hits Mewtwo
            }, 200) // Delay impact/health update slightly after attack animation starts
            setTimeout(() => {
              setCurrentAttack("none")
              setShowImpact(false)
            }, 400) // Reset attack/impact after a short duration
          } else {
            // mewtwo attacks
            setCurrentAttack("mewtwo")
            playSound("attack")
            setTimeout(() => {
              setShowImpact(true)
              playSound("hit")
              setPikachuHealth((prev) => Math.max(0, prev - event.damage)) // Mewtwo hits Pikachu
            }, 200)
            setTimeout(() => {
              setCurrentAttack("none")
              setShowImpact(false)
            }, 400)
          }
        }
      })

      // Check for battle end condition (Mewtwo defeated)
      if (mewtwoHealth <= 0 && battlePhase !== "victory") {
        setProgress(100) // Ensure progress bar is full
        setBattlePhase("victory")
        setPikachuCry(true)
        playSound("pikachuCry")
        setTimeout(() => {
          playSound("crash")
          setPokeballOpen(true) // Open pokeball
          playSound("capture") // Play capture sound
          setMewtwoCaptured(true) // Start Mewtwo capture animation
          setTimeout(() => {
            setBattlePhase("complete")
            playSound("transition")
            onComplete() // Transition to portfolio
          }, 1500) // Give time for capture animation
        }, 1000)
        cancelAnimationFrame(animationFrameRef.current!) // Stop the animation loop
        return
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [battlePhase, mewtwoHealth, pikachuHealth, onComplete, playSound, totalBattleDuration]) // Dependencies for useEffect

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-200 to-sky-100 relative overflow-hidden select-none">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f0f0f0"/><circle cx="50" cy="50" r="20" fill="%23ddd"/><circle cx="150" cy="50" r="15" fill="%23ddd"/><circle cx="100" cy="150" r="25" fill="%23ddd"/></svg>\')',
          backgroundSize: "200px",
        }}
      />

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

      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl sm:text-5xl text-black tracking-tight pixel-font mb-14">Loading Arena</h1>

        {/* Enhanced Pokémon Battle Area */}
        <div className="relative w-80 h-64 sm:w-96 sm:h-72 overflow-visible">
          {/* Battle Ground */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full h-8 bg-green-400 rounded-full opacity-60"></div>

          {/* Pikachu - visually centered and not overlapping */}
          <motion.div
            className="absolute -top-6 left-10 sm:left-16 w-20 sm:w-24 z-20 flex items-center justify-center"
            animate={
              currentAttack === "pikachu"
                ? {
                    x: [0, 40, 0],
                    scale: [1, 1.2, 1],
                    rotate: [0, -15, 0],
                  }
                : battlePhase === "fighting"
                  ? {
                      y: [0, -3, 0],
                      rotate: [0, 2, -2, 0],
                    }
                  : battlePhase === "victory"
                    ? {
                        scale: [1, 1.3, 1.1],
                        y: [0, -10, -5],
                        rotate: [0, 360],
                      }
                    : {}
            }
            transition={{
              duration: currentAttack === "pikachu" ? 0.6 : 1.5,
              repeat: battlePhase === "fighting" && currentAttack === "none" ? Number.POSITIVE_INFINITY : 0,
              ease: currentAttack === "pikachu" ? "easeInOut" : "easeInOut",
            }}
          >
            <img
              src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
              alt="Pikachu"
              className="w-full h-full object-contain drop-shadow-lg"
              style={{ imageRendering: 'pixelated' }}
            />
            {/* Pikachu's electric aura when attacking */}
            {currentAttack === "pikachu" && (
              <motion.div
                className="absolute inset-0 bg-yellow-300 rounded-full opacity-60"
                animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.6 }}
              />
            )}
          </motion.div>

          {/* Mewtwo - visually centered and not overlapping */}
          <AnimatePresence>
            {!mewtwoCaptured && (
              <motion.div
                className="absolute -top-10 right-10 sm:right-16 w-24 sm:w-28 z-20 flex items-center justify-center"
                animate={
                  currentAttack === "mewtwo"
                    ? {
                        x: [0, -40, 0],
                        scale: [1, 1.2, 1],
                        rotate: [0, 15, 0],
                      }
                    : showImpact && currentAttack === "none"
                      ? {
                          x: [-5, 5, -5, 5, 0],
                          filter: ["brightness(1)", "brightness(2)", "brightness(1)", "brightness(2)", "brightness(1)"],
                        }
                      : battlePhase === "fighting"
                        ? {
                            y: [0, -5, 0],
                            rotate: [0, -2, 2, 0],
                          }
                        : battlePhase === "victory"
                          ? {
                              x: [0, 20, 40],
                              y: [0, -10, 30],
                              rotate: [0, -45, -180],
                              scale: [1, 0.8, 0.6],
                              filter: ["brightness(1)", "brightness(0.5)", "brightness(0.2)"],
                            }
                          : {}
                }
                transition={{
                  duration: currentAttack === "mewtwo" ? 0.6 : showImpact ? 0.3 : 1.8,
                  repeat:
                    battlePhase === "fighting" && currentAttack === "none" && !showImpact
                      ? Number.POSITIVE_INFINITY
                      : 0,
                  ease: "easeInOut",
                }}
                exit={{
                  scale: [1, 0.1],
                  opacity: [1, 0],
                  y: [0, 50],
                  x: [0, -20],
                  transition: { duration: 0.5, ease: "easeIn" },
                }}
              >
                <img
                  src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
                  alt="Mewtwo"
                  className="w-full h-full object-contain drop-shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
                {/* Mewtwo's psychic aura when attacking */}
                {currentAttack === "mewtwo" && (
                  <motion.div
                    className="absolute inset-0 bg-purple-400 rounded-full opacity-60"
                    animate={{ scale: [0, 1.5, 0], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.6 }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Health Bars - moved higher to avoid overlapping Pokémon sprites */}
          <div className="absolute -top-10 left-0 w-full flex justify-between px-4 z-30">
            <div className="flex flex-col items-center">
              <span className="text-sm pixel-font text-black mb-1">Pikachu</span>
              <HealthBar health={pikachuHealth} />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm pixel-font text-black mb-1">Mewtwo</span>
              <HealthBar health={mewtwoHealth} />
            </div>
          </div>

          {/* Attack Effects */}
          <AnimatePresence>
            {currentAttack === "pikachu" && (
              <motion.div key="pikachu-attack"
                className="absolute top-8 left-20 w-32 h-8 z-25"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, x: [0, 80] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full h-full bg-yellow-400 rounded-full relative">
                  <div className="absolute inset-0 bg-yellow-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-1 left-2 w-2 h-2 bg-white rounded-full"></div>
                  <div className="absolute bottom-1 right-2 w-1 h-1 bg-white rounded-full"></div>
                </div>
              </motion.div>
            )}

            {currentAttack === "mewtwo" && (
              <motion.div key="mewtwo-attack"
                className="absolute top-6 right-20 w-24 h-24 z-25"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, x: [0, -60] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w-full h-full bg-purple-500 rounded-full relative opacity-80">
                  <motion.div
                    className="absolute inset-2 bg-purple-300 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.2, repeat: 2 }}
                  />
                  <div className="absolute top-2 left-2 w-3 h-3 bg-white rounded-full opacity-70"></div>
                </div>
              </motion.div>
            )}

            {showImpact && (
              <motion.div key="impact-effect"
                className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 z-30"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: [0, 2, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-full h-full relative">
                  <div className="absolute inset-0 bg-white rounded-full"></div>
                  <div className="absolute inset-1 bg-yellow-300 rounded-full"></div>
                  <div className="absolute inset-2 bg-orange-400 rounded-full"></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Lightning Effects */}
          <motion.svg
            className="absolute -top-6 right-6 sm:right-8 w-32 h-32 pointer-events-none z-30"
            viewBox="0 0 100 100"
            aria-hidden="true"
            animate={
              battlePhase === "victory"
                ? {
                    opacity: [0, 1, 0, 1, 0, 1, 1, 1, 0],
                    scale: [1, 2, 1, 2.5, 1, 3, 2, 1.5, 1],
                  }
                : currentAttack === "pikachu"
                  ? {
                      opacity: [0, 1, 0, 1, 0],
                      scale: [1, 1.5, 1],
                    }
                  : { opacity: 0 }
            }
            transition={{
              duration: battlePhase === "victory" ? 2 : 0.6,
              repeat: battlePhase === "victory" ? 1 : 0,
            }}
          >
            <g
              stroke="#ffe100"
              strokeWidth="4"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 8px #ffe100)" }}
            >
              <path d="M50 0 L62 25 L56 25 L68 50 L60 50 L75 80" fill="none" />
              <path d="M40 5 L52 30 L46 30 L58 55 L50 55 L65 85" fill="none" />
              <path d="M60 3 L72 28 L66 28 L78 53 L70 53 L85 83" fill="none" />
              <path d="M30 8 L42 33 L36 33 L48 58 L40 58 L55 88" fill="none" />
            </g>
          </motion.svg>

          {/* Pikachu Cry Text */}
          <AnimatePresence>
            {pikachuCry && (
              <motion.div key="pikachu-cry"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-yellow-400 pixel-font text-2xl sm:text-3xl z-40"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                Pika Pikaaaaachhuuuuuuu!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3D Pokéball Progress Container - MOVED HERE */}
        <div className="relative w-44 h-44 sm:w-48 sm:h-48 mt-8">
          <Canvas camera={{ position: [0, 0, 1.5], fov: 75 }} style={{ background: "#ADD8E6" }}>
            {" "}
            {/* Added background color */}
            <ambientLight intensity={0.8} />
            <pointLight position={[1, 1, 1]} intensity={0.5} />
            <pointLight position={[-1, -1, -1]} intensity={0.3} />
            <Suspense fallback={null}>
              <Pokeball3D progress={progress} isOpen={pokeballOpen} /> {/* Pass isOpen prop */}
            </Suspense>
          </Canvas>
        </div>

        {/* Percentage Display - Stays here, below the Pokeball */}
        <div
          className="mt-8 text-3xl sm:text-4xl font-semibold text-black tracking-tight"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-live="polite"
        >
          {Math.round(progress)}%
        </div>

        {/* Victory message */}
        <AnimatePresence>
          {battlePhase === "victory" && (
            <motion.div key="victory-message"
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="text-4xl sm:text-6xl font-bold text-yellow-600 pixel-font text-shadow-lg">
                PIKACHU WINS!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
