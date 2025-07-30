"use client"

// This component ensures Three.js dependencies are properly loaded
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere } from "@react-three/drei"
import { Suspense } from "react"

// Re-export for use in other components
export { Canvas, OrbitControls, Sphere, Suspense }
