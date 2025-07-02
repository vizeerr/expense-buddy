'use client'

import React, { useState } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle, CardAction,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'


export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
const dispatch = useDispatch()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const validateFields = () => {
    const { email, password } = form
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !password) {
      toast.error('All fields are required')
      return false
    }

    if (!emailRegex.test(email)) {
      toast.error('Invalid email format')
      return false
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateFields()) return

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/login', form)

    if (res.status === 200) {
        toast.success('Login successful!')
        dispatch(setUser(res.data.user)) // Save user to Redux
        router.push('/dashboard')
      }

    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold my-2">Login to your account</CardTitle>
          <CardDescription>Enter your email and password to login.</CardDescription>
          <CardAction>
            <Button variant="outline" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-lg">Password</Label>
                <Link href="/forget-password" className="text-sm underline hover:no-underline">Forgot password?</Link>
              </div>
              <Input id="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          </CardContent>

          <CardFooter className="mt-6">
            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
