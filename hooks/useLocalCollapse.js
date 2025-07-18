// hooks/useLocalCollapse.js
'use client'
import { useEffect, useState } from 'react'

export const useLocalCollapse = (key, defaultValue = false) => {
  const [collapsed, setCollapsed] = useState(defaultValue)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const stored = localStorage.getItem(`collapse-${key}`)
    if (stored !== null) {
      try {
        setCollapsed(JSON.parse(stored))
      } catch {
        setCollapsed(defaultValue)
      }
    }
  }, [isClient, key, defaultValue])

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(`collapse-${key}`, JSON.stringify(collapsed))
    }
  }, [collapsed, key, isClient])

  const toggle = () => setCollapsed(prev => !prev)

  return [collapsed, toggle]
}
