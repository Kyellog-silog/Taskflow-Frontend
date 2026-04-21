"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "dark" | "light"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  actualTheme: Theme
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("dark")

  useEffect(() => {
    const stored = localStorage.getItem("tf-theme") as Theme | null
    const resolved = stored ?? "dark"
    setThemeState(resolved)
    applyTheme(resolved)
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    root.classList.remove("dark", "light")
    root.classList.add(t)
  }

  const setTheme = (t: Theme) => {
    setThemeState(t)
    applyTheme(t)
    localStorage.setItem("tf-theme", t)
  }

  const value = { theme, setTheme, actualTheme: theme }
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
