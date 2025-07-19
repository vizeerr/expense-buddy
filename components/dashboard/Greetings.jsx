'use client'

import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CalendarDays, Sun, Moon, Sunrise, Sunset } from 'lucide-react'

export default function Greeting() {
  const user = useSelector((state) => state.auth?.user)
  const name = user?.name || 'User'

  const [now, setNow] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timeout)
  }, [])

  const hour = now.getHours()

  const greeting = (() => {
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 20) return 'Good Evening'
    return 'Good Night'
  })()

  const icon = (() => {
    if (hour < 12) return <Sun size={40} className="text-yellow-400" />
    if (hour < 17) return <Sunrise size={40} className="text-orange-300" />
    if (hour < 20) return <Sunset size={40} className="text-pink-400" />
    return <Moon size={40} className="text-indigo-400" />
  })()

  const formattedTime = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-6 rounded-2xl border-2 border-neutral-600 w-full drop-shadow-2xl drop-shadow-amber-700 ">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {loading ? (
            <div className="h-8 w-24 bg-zinc-700 animate-pulse rounded-md" />
          ) : (
            <h2 className="text-2xl font-bold text-white leading-snug">{formattedTime}</h2>
          )}

          {loading ? (
            <div className="h-6 w-52 bg-zinc-700 animate-pulse rounded-md" />
          ) : (
            <p className="text-lg text-neutral-300">
              {greeting},{' '}
              <span className="text-amber-400 font-semibold italic capitalize">{name}</span>
            </p>
          )}

          {loading ? (
            <div className="h-4 w-40 bg-zinc-700 animate-pulse rounded-md mt-2" />
          ) : (
            <p className="text-sm text-neutral-400 mt-2 flex items-center gap-1">
              <CalendarDays size={16} />
              {formattedDate}
            </p>
          )}
        </div>

        <div className="ml-4">
          {loading ? (
            <div className="h-10 w-10 bg-zinc-700 animate-pulse rounded-full" />
          ) : (
            icon
          )}
        </div>
      </div>
    </div>
  )
}
