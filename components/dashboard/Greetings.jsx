'use client'

import React from 'react'
import { useSelector } from 'react-redux'

export default function Greeting() {
  const user = useSelector((state) => state.auth?.user) // adjust as per your state shape
  const name = user?.name || '...'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    if (hour < 20) return 'Good Evening'
    return 'Good Night'
  }

  return (
    <div className="px-2">
      <h2 className="xl:text-xl text-lg text-neutral-400">
        {getGreeting()}, <br/> <span className="xl:text-2xl text-2xl mt font-medium text-neutral-300 italic capitalize">{name}</span>
      </h2>
    </div>
  )
}
