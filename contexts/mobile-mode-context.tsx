"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface MobileModeContextType {
  isMobileMode: boolean
  toggleMobileMode: () => void
}

const MobileModeContext = createContext<MobileModeContextType | undefined>(undefined)

export function MobileModeProvider({ children }: { children: ReactNode }) {
  const [isMobileMode, setIsMobileMode] = useState(false)

  const toggleMobileMode = () => {
    setIsMobileMode((prev) => !prev)
  }

  return <MobileModeContext.Provider value={{ isMobileMode, toggleMobileMode }}>{children}</MobileModeContext.Provider>
}

export function useMobileMode() {
  const context = useContext(MobileModeContext)
  if (context === undefined) {
    throw new Error("useMobileMode must be used within a MobileModeProvider")
  }
  return context
}
