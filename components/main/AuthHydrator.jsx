'use client'

import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setUser } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthHydrator() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const user = useSelector((state) => state.auth.user)

  const publicRoutes = ['/', '/login', '/signup'] // add more if needed

  useEffect(() => {
    // Only run if:
    // - No user in Redux (i.e., not authenticated)
    // - Current route is public
    const shouldCheckAuth = !user
    
    if (!shouldCheckAuth) return

    const fetchUser = async () => {
      try {
        const res = await axios.get('/api/auth/me')
        if (res.data.authenticated) {
          dispatch(setUser(res.data.user))

          // Push to dashboard if not already there
          if (!pathname.startsWith('/dashboard')) {
            router.push('/dashboard')
          }
        }
      } catch (err) {
      }
    }

    fetchUser()
  }, [user, pathname, dispatch, router])

  return null
}
