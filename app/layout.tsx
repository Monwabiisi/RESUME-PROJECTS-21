import type React from "react"
import type { Metadata } from "next"
import { Press_Start_2P } from "next/font/google"
import "./globals.css"
import { MobileModeProvider } from "@/contexts/mobile-mode-context" // Import the provider

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "Monwabisi Ndlovu",
  description: "Software Engineer | Mobile & Web Developer | Problem Solver",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${pressStart2P.variable} antialiased`}>
        <MobileModeProvider>{children}</MobileModeProvider> {/* Wrap children with the provider */}
      </body>
    </html>
  )
}
