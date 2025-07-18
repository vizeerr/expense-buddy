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
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/slices/authSlice'
import axios from 'axios' // use your axios instance if you have

const LoginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Lowercase letter required')
    .regex(/[A-Z]/, 'Uppercase letter required')
    .regex(/\d/, 'Number required')
    .regex(/[^a-zA-Z0-9]/, 'Special character required'),
})

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
    setErrors({ ...errors, [e.target.id]: '' }) // Clear error on input
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = LoginSchema.safeParse(form)

    if (!result.success) {
      console.log(result);
      
      setErrors(result.error.flatten().fieldErrors)
      toast.error('Please fix validation errors')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/login', form)

      if (res.status === 200 && res.data.success) {
        toast.success('Login successful!')
        dispatch(setUser(res.data.user))
        router.push('/dashboard')
      } else {
        toast.error(res.data.message || 'Login failed')
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'Something went wrong')
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
            {/* Email */}
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email[0]}</p>}
            </div>

            {/* Password */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-lg">Password</Label>
                <Link href="/login/forgot-password" className="text-sm underline hover:no-underline">Forgot password?</Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 cursor-pointer text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password[0]}</p>}
            </div>
          </CardContent>

          <CardFooter className="mt-6">
            <Button type="submit" className="w-full font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
