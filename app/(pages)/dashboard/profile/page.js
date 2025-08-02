'use client'

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/store/slices/authSlice'
import axios from 'axios'
import { Button } from '@/components/ui/button'

const ProfilePage = () => {
  const dispatch = useDispatch()
  const router = useRouter()
  const user = useSelector((state) => state.auth.user)

  const handleLogout = async () => {
    try {
      const res = await axios.post('/api/auth/logout')
      if (res.status === 200) {
        dispatch(logoutUser())
        router.push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) {
    return <p className="text-center mt-10 text-muted-foreground">Not logged in.</p>
  }

  return (
    <div className="max-w-md mx-auto mt-10 px-4 py-6 border rounded-xl bg-muted/10">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">Name:</p>
        <p className="text-lg font-medium">{user.name}</p>
      </div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">Email:</p>
        <p className="text-lg font-medium">{user.email}</p>
      </div>
      <Button variant="destructive" onClick={handleLogout} className="w-full">
        Logout
      </Button>
    </div>
  )
}

export default ProfilePage
