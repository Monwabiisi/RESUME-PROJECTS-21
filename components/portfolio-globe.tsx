"use client"

import { Suspense, useRef, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import { Canvas, OrbitControls, Sphere } from "./three-setup"
import { motion, AnimatePresence } from "framer-motion"
import * as THREE from "three"
import BinaryBackground from "./binary-background"
import ContactForm from "./contact-form"
import GameSelection from "./game-selection" // Import the new component
import { Mail, Phone, MapPin, Smartphone, Monitor } from "lucide-react" // Import Lucide icons
import { useMobileMode } from "@/contexts/mobile-mode-context" // Import the mobile mode hook

function Globe() {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current && !hovered) {
      meshRef.current.rotation.y += 0.0008
    }
  })

  const createEarthTexture = () => {
    const loader = new THREE.TextureLoader()
    return loader.load("https://cdn.jsdelivr.net/gh/ajdruff/earth-textures@main/2_no_clouds_4k.jpg")
  }

  return (
    <Sphere
      ref={meshRef}
      args={[1, 64, 64]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <meshStandardMaterial map={createEarthTexture()} roughness={0.8} metalness={0.2} />
    </Sphere>
  )
}

// Generic Pokémon Pixel Art Component for sections
const PokemonSectionArt = ({
  spriteUrl,
  altText,
  animationType,
  className,
}: {
  spriteUrl: string
  altText: string
  animationType: string
  className?: string
}) => (
  <motion.div
    className={`relative w-24 h-24 ${className}`}
    animate={animationType}
    transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2, ease: "easeInOut" }}
  >
    <img src={spriteUrl || "/placeholder.svg"} alt={altText} className="w-full h-full pixelated" />
  </motion.div>
)

export default function PortfolioGlobe() {
  const [showContactForm, setShowContactForm] = useState(false)
  const [showFireAnimation, setShowFireAnimation] = useState(false) // New state for fire animation
  const [showWaterAnimation, setShowWaterAnimation] = useState(false) // New state for water animation
  const { isMobileMode, toggleMobileMode } = useMobileMode() // Use the mobile mode hook

  const downloadCV = () => {
    const cvContent = `
MONWABISI NDLOVU
Software Engineer | Mobile & Web Developer | Problem Solver

Location: Pretoria, South Africa
Email: ntandondlovu030702@gmail.com
Phone: 068 346 7777

PROFESSIONAL SUMMARY
Motivated Computer Software Engineering graduate pursuing Advanced Diploma in ICT (NQF Level 7).
Skilled in Java, Python, C#, HTML, CSS, and JavaScript with hands-on experience in mobile and web development.

TECHNICAL SKILLS
• Programming Languages: Java, Python, JavaScript, C#, HTML, CSS
• Frameworks/Tools: Android Studio, Firebase, Git, MySQL, NetBeans, Visual Studio Code
• Core Competencies: Digital fluency, customer-focused development, innovation, analytical thinking

EDUCATION
• Advanced Diploma in Information & Communications Technology (NQF 7) - DUT (2025)
• Diploma in Business Analysis in Information & Communications Technology (NQF 6) - DUT (2021-2024)

KEY PROJECTS
• Peer Tutoring Platform - Java, Firebase, Android Studio
• Campus Security Alert App - Real-time emergency system with panic button
• Mentorship Management System - Student-mentor connection platform

EXPERIENCE
• Assistant Teacher (Volunteer) - DUT (Feb 2023 - Nov 2023)
• Project Team Leader - Led 9-member development team

CERTIFICATIONS
• Introduction to Cybersecurity - Cisco Networking Academy
• ISTQB Foundation Level Certification (Planned 2026)

LANGUAGES
• English: Fluent
• isiZulu: Fluent  
• Afrikaans: Moderate
    `

    const blob = new Blob([cvContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "Monwabisi_Ndlovu_CV.txt" // Changed to .txt
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Play download sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.3)
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  // Trigger fire animation periodically when skills section is in view
  const skillsSectionRef = useRef<HTMLElement>(null)
  const educationSectionRef = useRef<HTMLElement>(null) // New ref for Education section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowFireAnimation(true)
        } else {
          setShowFireAnimation(false)
        }
      },
      { threshold: 0.4 }, // Trigger when 40% of the section is visible
    )

    if (skillsSectionRef.current) {
      observer.observe(skillsSectionRef.current)
    }

    return () => {
      if (skillsSectionRef.current) {
        observer.unobserve(skillsSectionRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowWaterAnimation(true)
        } else {
          setShowWaterAnimation(false)
        }
      },
      { threshold: 0.4 }, // Trigger when 40% of the section is visible
    )

    if (educationSectionRef.current) {
      observer.observe(educationSectionRef.current)
    }

    return () => {
      if (educationSectionRef.current) {
        observer.unobserve(educationSectionRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-black relative overflow-y-auto scroll-smooth">
      <BinaryBackground />

      {/* 3D Globe - Fixed at top */}
      <div className="sticky top-0 h-screen w-full flex items-center justify-center">
        <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 2, 5]} intensity={0.6} />

          <Suspense fallback={null}>
            <Globe />
            <OrbitControls enableZoom={false} enablePan={false} enableDamping />
          </Suspense>
        </Canvas>

        {/* Content Overlay for Globe */}
        <div className="absolute top-0 left-0 w-full p-6 flex flex-col items-center pointer-events-none">
          <motion.h2
            className="text-xl sm:text-2xl tracking-tight pixel-font text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            Monwabisi Ndlovu
          </motion.h2>

          <motion.p
            className="mt-3 text-sm sm:text-base font-light text-gray-300 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            Software Engineer | Mobile & Web Developer | Problem Solver
          </motion.p>

          <motion.div
            className="mt-2 text-xs sm:text-sm font-light text-gray-400 text-center flex flex-wrap justify-center gap-x-4 gap-y-1" // Added flexbox for icons
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> ntandondlovu030702@gmail.com
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> 068 346 7777
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Pretoria, South Africa
            </div>
          </motion.div>

          <motion.nav
            className="mt-4 flex flex-wrap justify-center gap-4 text-xs sm:text-sm font-light pointer-events-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <motion.button
              onClick={() => setShowContactForm(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-mono transition-colors duration-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1.7 }}
            >
              Contact Me
            </motion.button>

            <motion.button
              onClick={downloadCV}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-md font-mono transition-colors duration-200"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 1.8 }}
              aria-label="Download Monwabisi Ndlovu's CV as a text file" // Added aria-label
            >
              Download CV
            </motion.button>
          </motion.nav>
        </div>
      </div>

      {/* Mobile Mode Toggle Button */}
      <motion.button
        onClick={toggleMobileMode}
        className="fixed bottom-4 right-4 z-50 p-3 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-colors duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isMobileMode ? "Switch to Desktop Mode" : "Switch to Mobile Mode"}
      >
        {isMobileMode ? <Monitor size={24} /> : <Smartphone size={24} />}
      </motion.button>

      {/* Scrollable Content Sections */}
      <div className={`relative z-10 bg-gray-950 text-white py-16 ${isMobileMode ? "mobile-optimized-layout" : ""}`}>
        {/* About Section */}
        <motion.section
          id="about"
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-green-400 pixel-font mb-8">ABOUT ME</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png" // Dragonite
            altText="Dragonite"
            animationType={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            className="mb-8"
          />
          <p className="text-lg leading-relaxed max-w-2xl">
            Motivated and detail-oriented Computer Software Engineering graduate currently pursuing an Advanced Diploma
            in Information and Communications Technology (ICT), equivalent to an NQF Level 7 qualification. Skilled in
            Java, Python, C#, HTML, CSS, and JavaScript, with hands-on experience in developing mobile and web
            applications using Android Studio and modern frameworks. Demonstrates strong problem-solving abilities,
            teamwork, and a commitment to innovation. Seeking a graduate or junior software engineering role to
            contribute meaningfully to real-world software solutions while continuing professional development.
          </p>
        </motion.section>

        {/* Skills Section */}
        <motion.section
          id="skills"
          ref={skillsSectionRef} // Attach ref here
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg relative" // Added relative for absolute positioning of fire
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-blue-400 pixel-font mb-8">SKILLS</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png" // Charizard
            altText="Charizard"
            animationType={{ x: [0, 10, 0], rotate: [0, -5, 5, 0] }}
            className="mb-8"
          />

          {/* Charizard Fire Puff Effect */}
          <AnimatePresence>
            {showFireAnimation && (
              <motion.div
                className="absolute w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-300 opacity-0"
                style={{
                  top: "25%", // Estimated vertical position of Charizard
                  left: "50%", // Estimated horizontal position of Charizard
                  transform: "translate(-50%, -50%)", // Center the puff
                  filter: "blur(5px)",
                  zIndex: 30,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0] }}
                transition={{ duration: 0.4, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.5 }} // Shorter duration, longer repeatDelay
              />
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-blue-600 cursor-pointer transition-transform hover:scale-105 hover:border-yellow-400 hover:bg-gray-700 group"
              whileHover={{ scale: 1.08, boxShadow: "0 0 24px 6px #fbbf24" }}
              animate={
                showFireAnimation
                  ? {
                      boxShadow: [
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                        "0 0 8px 3px rgba(255, 180, 0, 0.7), 0 0 15px 6px rgba(255, 80, 0, 0.5)",
                        "0 0 6px 2px rgba(255, 140, 0, 0.6), 0 0 12px 5px rgba(255, 40, 0, 0.4)",
                        "0 0 9px 4px rgba(255, 190, 0, 0.9), 0 0 18px 7px rgba(255, 90, 0, 0.7)",
                        "0 0 7px 3px rgba(255, 150, 0, 0.6), 0 0 14px 5px rgba(255, 50, 0, 0.4)",
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                      ],
                    }
                  : { boxShadow: "none" }
              }
              transition={{
                duration: 0.8, // Faster flicker
                repeat: showFireAnimation ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              <h4 className="text-xl font-semibold text-blue-300 mb-2">Programming Languages</h4>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Java</li>
                <li>Python</li>
                <li>JavaScript</li>
                <li>C#</li>
                <li>HTML</li>
                <li>CSS</li>
              </ul>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-blue-600 cursor-pointer transition-transform hover:scale-105 hover:border-yellow-400 hover:bg-gray-700 group"
              whileHover={{ scale: 1.08, boxShadow: "0 0 24px 6px #fbbf24" }}
              animate={
                showFireAnimation
                  ? {
                      boxShadow: [
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                        "0 0 8px 3px rgba(255, 180, 0, 0.7), 0 0 15px 6px rgba(255, 80, 0, 0.5)",
                        "0 0 6px 2px rgba(255, 140, 0, 0.6), 0 0 12px 5px rgba(255, 40, 0, 0.4)",
                        "0 0 9px 4px rgba(255, 190, 0, 0.9), 0 0 18px 7px rgba(255, 90, 0, 0.7)",
                        "0 0 7px 3px rgba(255, 150, 0, 0.6), 0 0 14px 5px rgba(255, 50, 0, 0.4)",
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                      ],
                    }
                  : { boxShadow: "none" }
              }
              transition={{
                duration: 0.8, // Faster flicker
                repeat: showFireAnimation ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              <h4 className="text-xl font-semibold text-blue-300 mb-2">Frameworks/Tools</h4>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Android Studio</li>
                <li>Firebase</li>
                <li>Git</li>
                <li>MySQL</li>
                <li>NetBeans</li>
                <li>Visual Studio Code</li>
              </ul>
            </motion.div>
            <motion.div
              className="bg-gray-800 p-6 rounded-lg border border-blue-600 cursor-pointer transition-transform hover:scale-105 hover:border-yellow-400 hover:bg-gray-700 group"
              whileHover={{ scale: 1.08, boxShadow: "0 0 24px 6px #fbbf24" }}
              animate={
                showFireAnimation
                  ? {
                      boxShadow: [
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                        "0 0 8px 3px rgba(255, 180, 0, 0.7), 0 0 15px 6px rgba(255, 80, 0, 0.5)",
                        "0 0 6px 2px rgba(255, 140, 0, 0.6), 0 0 12px 5px rgba(255, 40, 0, 0.4)",
                        "0 0 9px 4px rgba(255, 190, 0, 0.9), 0 0 18px 7px rgba(255, 90, 0, 0.7)",
                        "0 0 7px 3px rgba(255, 150, 0, 0.6), 0 0 14px 5px rgba(255, 50, 0, 0.4)",
                        "0 0 5px 2px rgba(255, 165, 0, 0.5), 0 0 10px 4px rgba(255, 69, 0, 0.3)",
                      ],
                    }
                  : { boxShadow: "none" }
              }
              transition={{
                duration: 0.8, // Faster flicker
                repeat: showFireAnimation ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
              }}
            >
              <h4 className="text-xl font-semibold text-blue-300 mb-2">Soft Skills</h4>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Effective communication</li>
                <li>Collaboration</li>
                <li>Adaptability</li>
                <li>Time management</li>
                <li>Resilience</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* Education Section */}
        <motion.section
          id="education"
          ref={educationSectionRef} // Attach ref here
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto relative" // Added relative for absolute positioning of water
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-purple-400 pixel-font mb-8">EDUCATION</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png" // Gyarados
            altText="Gyarados"
            animationType={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
            className="mb-8"
          />

          {/* Education Content Card with Water Border */}
          <div className="relative bg-gray-900 p-8 rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
            {/* Animated Water Border */}
            <AnimatePresence>
              {showWaterAnimation && (
                <>
                  {/* Top Water Border */}
                  <motion.div
                    className="absolute top-0 left-0 w-full h-1 z-10"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #0891b2, #3b82f6, transparent)",
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "200% 0%"],
                      height: ["1px", "3px", "2px", "4px", "1px"],
                      opacity: [0.6, 1, 0.8, 1, 0.6],
                    }}
                    transition={{
                      backgroundPosition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                      height: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                      opacity: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
                    }}
                  />

                  {/* Right Water Border */}
                  <motion.div
                    className="absolute top-0 right-0 w-1 h-full z-10"
                    style={{
                      background:
                        "linear-gradient(180deg, transparent, #3b82f6, #06b6d4, #0891b2, #3b82f6, transparent)",
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "0% 200%"],
                      width: ["1px", "3px", "2px", "4px", "1px"],
                      opacity: [0.6, 1, 0.8, 1, 0.6],
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        delay: 0.75,
                      },
                      width: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 },
                      opacity: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.3 },
                    }}
                  />

                  {/* Bottom Water Border */}
                  <motion.div
                    className="absolute bottom-0 right-0 w-full h-1 z-10"
                    style={{
                      background:
                        "linear-gradient(270deg, transparent, #3b82f6, #06b6d4, #0891b2, #3b82f6, transparent)",
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "200% 0%"],
                      height: ["1px", "3px", "2px", "4px", "1px"],
                      opacity: [0.6, 1, 0.8, 1, 0.6],
                    }}
                    transition={{
                      backgroundPosition: { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear", delay: 1.5 },
                      height: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1 },
                      opacity: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 },
                    }}
                  />

                  {/* Left Water Border */}
                  <motion.div
                    className="absolute bottom-0 left-0 w-1 h-full z-10"
                    style={{
                      background: "linear-gradient(0deg, transparent, #3b82f6, #06b6d4, #0891b2, #3b82f6, transparent)",
                      filter: "blur(0.5px)",
                    }}
                    animate={{
                      backgroundPosition: ["0% 0%", "0% 200%"],
                      width: ["1px", "3px", "2px", "4px", "1px"],
                      opacity: [0.6, 1, 0.8, 1, 0.6],
                    }}
                    transition={{
                      backgroundPosition: {
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                        delay: 2.25,
                      },
                      width: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 1.5 },
                      opacity: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.9 },
                    }}
                  />

                  {/* Swimming Gyarados around the card border */}
                  <motion.div
                    className="absolute w-8 h-8 z-20"
                    style={{
                      filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.8))",
                    }}
                    initial={{
                      x: "-16px",
                      y: "-16px",
                      rotate: 0,
                    }}
                    animate={{
                      x: [
                        "-16px", // Top-left corner
                        "calc(100% - 16px)", // Top-right corner
                        "calc(100% - 16px)", // Top-right corner
                        "calc(100% - 16px)", // Bottom-right corner
                        "-16px", // Bottom-left corner
                        "-16px", // Bottom-left corner
                        "-16px", // Top-left corner
                        "-16px", // Top-left corner
                      ],
                      y: [
                        "-16px", // Top
                        "-16px", // Top
                        "calc(100% - 16px)", // Right side
                        "calc(100% - 16px)", // Bottom
                        "calc(100% - 16px)", // Bottom
                        "-16px", // Left side
                        "-16px", // Top
                        "-16px", // Top
                      ],
                      rotate: [
                        0, // Facing right
                        90, // Facing down
                        90, // Facing down
                        180, // Facing left
                        180, // Facing left
                        270, // Facing up
                        270, // Facing up
                        360, // Facing right again
                      ],
                    }}
                    transition={{
                      duration: 8,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 1],
                    }}
                  >
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
                      alt="Swimming Gyarados"
                      className="w-full h-full pixelated"
                    />
                    {/* Water trail behind swimming Gyarados */}
                    <motion.div
                      className="absolute -z-10 w-4 h-4 rounded-full bg-gradient-to-br from-blue-300 to-cyan-200 opacity-70"
                      style={{
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        filter: "blur(2px)",
                      }}
                      animate={{
                        scale: [0.3, 0.8, 0.3],
                        opacity: [0.7, 0.3, 0.7],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>

                  {/* Realistic Wave Effects on the borders */}
                  <motion.div
                    className="absolute top-0 left-1/4 w-8 h-2 bg-gradient-to-r from-transparent via-blue-300 to-transparent opacity-0 rounded-full"
                    style={{ filter: "blur(1px)" }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleY: [0.5, 1.5, 0.5],
                      x: [0, 20, 40],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  />

                  <motion.div
                    className="absolute right-0 top-1/3 w-2 h-8 bg-gradient-to-b from-transparent via-blue-300 to-transparent opacity-0 rounded-full"
                    style={{ filter: "blur(1px)" }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleX: [0.5, 1.5, 0.5],
                      y: [0, 20, 40],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 0.8,
                    }}
                  />

                  <motion.div
                    className="absolute bottom-0 right-1/4 w-8 h-2 bg-gradient-to-l from-transparent via-blue-300 to-transparent opacity-0 rounded-full"
                    style={{ filter: "blur(1px)" }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleY: [0.5, 1.5, 0.5],
                      x: [0, -20, -40],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 1.4,
                    }}
                  />

                  <motion.div
                    className="absolute left-0 bottom-1/3 w-2 h-8 bg-gradient-to-t from-transparent via-blue-300 to-transparent opacity-0 rounded-full"
                    style={{ filter: "blur(1px)" }}
                    animate={{
                      opacity: [0, 0.8, 0],
                      scaleX: [0.5, 1.5, 0.5],
                      y: [0, -20, -40],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: 2,
                    }}
                  />
                </>
              )}
            </AnimatePresence>

            <h4 className="text-2xl font-semibold text-purple-300 mb-4">Durban University of Technology</h4>
            <div className="mb-4">
              <p className="text-lg font-medium">Advanced Diploma in Information & Communications Technology (NQF 7)</p>
              <p className="text-gray-400">Feb 2025 – Nov 2025 (Expected Completion)</p>
            </div>
            <div>
              <p className="text-lg font-medium">
                Diploma in Business Analysis in Information & Communications Technology (NQF 6)
              </p>
              <p className="text-gray-400">Feb 2021 – Nov 2024 (Completed)</p>
              <p className="text-sm text-gray-500 mt-2">
                Key Modules: Data Structures, Software Engineering, Web Development, Database Systems, Cybersecurity
              </p>
            </div>
          </div>
        </motion.section>

        {/* Projects Section */}
        <motion.section
          id="projects"
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-red-400 pixel-font mb-8">PROJECTS</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png" // Tyranitar
            altText="Tyranitar"
            animationType={{ scale: [1, 1.1, 1], rotate: [0, -3, 3, 0] }}
            className="mb-8"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="bg-gray-800 p-6 rounded-lg border border-red-600 text-left">
              <h4 className="text-xl font-semibold text-red-300 mb-2">Peer Tutoring Platform</h4>
              <p className="text-sm text-gray-400 mb-2">Technologies: Java, Firebase, Android Studio</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Developed a web application connecting university students with peer tutors.</li>
                <li>Integrated Firebase Authentication and real-time database features.</li>
                <li>Designed secure login, session booking, and user rating systems.</li>
                <li>Ensured scalability and a user-friendly mentor/mentee dashboard experience.</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-600 text-left">
              <h4 className="text-xl font-semibold text-red-300 mb-2">Campus Security Alert App (Mobile App)</h4>
              <p className="text-sm text-gray-400 mb-2">Technologies: Java, XML, Android Studio</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Built a real-time alert system for campus emergencies.</li>
                <li>
                  Key features: panic button, silent alerts, trusted contact system, geolocation, and emergency chat.
                </li>
                <li>Integrated interactive safety quiz to raise awareness.</li>
                <li>Supported admin-side broadcast messaging functionality.</li>
              </ul>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg border border-red-600 text-left md:col-span-2">
              <h4 className="text-xl font-semibold text-red-300 mb-2">Mentorship Management System</h4>
              <p className="text-sm text-gray-400 mb-2">Technologies: Java, Firebase</p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>Designed a web-based system to connect first-year students with senior mentors.</li>
                <li>Implemented role-based access, secure messaging, mentorship scheduling, and progress tracking.</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Experience Section */}
        <motion.section
          id="experience"
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-yellow-400 pixel-font mb-8">EXPERIENCE & LEADERSHIP</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png" // Rayquaza
            altText="Rayquaza"
            animationType={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            className="mb-8"
          />
          <div className="bg-gray-900 p-8 rounded-lg shadow-lg border border-yellow-600 w-full max-w-2xl">
            <div className="mb-6">
              <h4 className="text-2xl font-semibold text-yellow-300 mb-2">Assistant Teacher (Volunteer)</h4>
              <p className="text-lg font-medium text-gray-400">Durban University of Technology</p>
              <p className="text-gray-500">February 2023 – November 2023</p>
              <ul className="list-disc list-inside text-sm text-left mt-2 space-y-1">
                <li>
                  Assisted in teaching foundational and advanced programming concepts including OOPs, Arrays, Trees, and
                  other data structures.
                </li>
                <li>
                  Supported students by explaining complex topics in an accessible manner, facilitating better
                  understanding and practical application.
                </li>
                <li>Helped develop lesson materials and conducted tutorials to reinforce course content.</li>
                <li>Provided one-on-one guidance and mentorship to students struggling with coding concepts.</li>
              </ul>
            </div>
            <div>
              <h4 className="text-2xl font-semibold text-yellow-300 mb-2">Project Team Leader</h4>
              <p className="text-lg font-medium text-gray-400">Final-Year Software Engineering Capstone Project</p>
              <ul className="list-disc list-inside text-sm text-left mt-2 space-y-1">
                <li>
                  Oversaw a 9-member development team during the final-year software engineering capstone project.
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Certifications Section */}
        <motion.section
          id="certifications"
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-orange-400 pixel-font mb-8">CERTIFICATIONS</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/643.png" // Reshiram (Dragon/Fire)
            altText="Reshiram"
            animationType={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            className="mb-8"
          />
          <div className="bg-gray-800 p-6 rounded-lg border border-orange-600 w-full max-w-md">
            <ul className="list-disc list-inside text-left text-lg space-y-2">
              <li>Introduction to Cybersecurity – Cisco Networking Academy</li>
              <li>Planned: ISTQB Foundation Level Certification (Targeting 2026)</li>
            </ul>
          </div>
        </motion.section>

        {/* Games Section */}
        <motion.section
          id="games"
          className="min-h-screen flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg"
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <h3 className="text-4xl font-bold text-pink-400 pixel-font mb-8">PLAY SOME GAMES!</h3>
          <PokemonSectionArt
            spriteUrl="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/181.png" // Ampharos (Electric/Dragon-like)
            altText="Ampharos"
            animationType={{ x: [0, 5, -5, 0], y: [0, -5, 0] }}
            className="mb-8"
          />
          <GameSelection />
        </motion.section>
      </div>

      {/* Contact Form Modal */}
      <ContactForm isOpen={showContactForm} onClose={() => setShowContactForm(false)} />
    </div>
  )
}
