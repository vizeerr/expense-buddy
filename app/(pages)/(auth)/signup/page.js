'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import {
  InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot
} from "@/components/ui/input-otp"
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string()
  .min(3, 'Name must be at least 3 characters')
  .regex(/^[A-Za-z\s]+$/, 'Name cannot contain numbers or symbols'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Lowercase letter required')
    .regex(/[A-Z]/, 'Uppercase letter required')
    .regex(/\d/, 'Number required')
    .regex(/[^a-zA-Z0-9]/, 'Special character required'),
  cpassword: z.string()
}).refine(data => data.password === data.cpassword, {
  message: 'Passwords do not match',
  path: ['cpassword']
})

const otpRegex = /^\d{6}$/

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', name: '', password: '', cpassword: '' })
  const [errors, setErrors] = useState({})
  const [otp, setOtp] = useState('')
  const [showOTP, setShowOTP] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (cooldown === 0) return
    const interval = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
    setErrors(prev => ({ ...prev, [e.target.id]: null }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = RegisterSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors
      setErrors(fieldErrors)
      toast.error('Please fix the errors')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/signup', {
        email: form.email,
        name: form.name,
        password: form.password,
      })

      if (res.status === 200) {
        toast.success('OTP sent to your email')
        setShowOTP(true)
        setCooldown(60)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    if (!otpRegex.test(otp)) {
      toast.error('Enter a valid 6-digit OTP')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/signup/verify-otp', {
        email: form.email,
        otp
      })

      if (res.status === 200) {
        toast.success('Account verified! Please login.')
        setForm({ email: '', name: '', password: '', cpassword: '' })
        setOtp('')
        setShowOTP(false)
        router.push('/login')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (cooldown > 0) return

    try {
      const res = await axios.post('/api/auth/signup/resend-otp', { email: form.email })
      if (res.status === 200) {
        toast.success('OTP resent')
        setCooldown(60)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-lg">
        {!showOTP ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold my-2">Create a new account</CardTitle>
              <CardDescription>Enter your name and email to register your account</CardDescription>
              <div className="mt-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Already have an account? Login</Link>
                </Button>
              </div>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={handleChange} disabled={loading} required />
                  {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" type="text" value={form.name} onChange={handleChange} disabled={loading} required />
                  <ul className="text-sm text-red-500 space-y-1">
                    {errors.name?.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={form.password} onChange={handleChange} disabled={loading} required />
                  <ul className="text-sm text-red-500 space-y-1">
                    {errors.password?.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cpassword">Confirm Password</Label>
                  <Input id="cpassword" type="password" value={form.cpassword} onChange={handleChange} disabled={loading} required />
                  <ul className="text-sm text-red-500 space-y-1">
                    {errors.cpassword?.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="mt-6">
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? 'Creating Account...' : 'Register Account'}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold my-2">Verify OTP</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Enter the 6-digit OTP sent to <b>{form.email}</b></span>
                <Button variant="outline" onClick={handleResendOTP} disabled={cooldown > 0}>
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </Button>
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleOTPSubmit}>
              <CardContent className="space-y-4">
                <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} disabled={loading} required>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </CardContent>

              <CardFooter className="py-4">
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
