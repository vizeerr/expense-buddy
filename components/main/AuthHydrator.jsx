'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AuthHydrator() {
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me')
        if (res.data.authenticated) {
          dispatch(setUser(res.data.user))
          toast.success('login')
          // router.push('/dashboard')
        }
      } catch (err) {
        console.log('Not logged in:', err)
      }
    }

    fetchUser()
  }, [dispatch])

  return null
}
