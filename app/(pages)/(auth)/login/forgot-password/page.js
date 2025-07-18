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
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { useRouter } from 'next/navigation'
import { z } from 'zod'

const EmailSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

const OtpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
})

const PasswordSchema = z.object({
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Lowercase letter required')
    .regex(/[A-Z]/, 'Uppercase letter required')
    .regex(/\d/, 'Number required')
    .regex(/[^a-zA-Z0-9]/, 'Special character required'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export default function ForgetPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [errors, setErrors] = useState({})

  const router = useRouter()

  useEffect(() => {
    if (cooldown === 0) return
    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(interval)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const extractFieldErrors = (error) => {
    const res = error?.response?.data
    if (res?.error && typeof res.error === 'object') {
      return res.error
    }
    return {}
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    const result = EmailSchema.safeParse({ email })

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      toast.error('Please fix validation errors')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/forget-password/send-otp', { email })
      if (res.status === 200) {
        toast.success('OTP sent to your email')
        setStep(2)
        setCooldown(60)
      }
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      const msg = typeof fieldErrors === 'string' ? fieldErrors : 'Failed to send OTP'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    const result = OtpSchema.safeParse({ otp })

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      toast.error('Please fix validation errors')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/forget-password/verify-otp', { email, otp })
      if (res.status === 200) {
        toast.success('OTP Verified')
        setStep(3)
      }
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      const msg = typeof fieldErrors === 'string' ? fieldErrors : 'OTP verification failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    const result = PasswordSchema.safeParse({ password, confirmPassword })

    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors)
      toast.error('Please fix validation errors')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/forget-password/reset-password', { email, password })
      if (res.status === 200) {
        toast.success('Password reset successfully!')
        router.push('/login')
      }
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      const msg = typeof fieldErrors === 'string' ? fieldErrors : 'Password reset failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    
    if (cooldown > 0) return

    try {
      const res = await axios.post('/api/auth/forget-password/send-otp', { email })
      if (res.status === 200) {
        toast.success('OTP resent to your email')
        setCooldown(60)
      }
    } catch (err) {
      const fieldErrors = extractFieldErrors(err)
      setErrors(fieldErrors)
      const msg = typeof fieldErrors === 'string' ? fieldErrors : 'Failed to resend OTP'
      toast.error(msg)
    }
    
  }


  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <Card className="w-full max-w-lg">
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold my-2">Forgot Password?</CardTitle>
              <CardDescription>Enter your email to receive an OTP.</CardDescription>
              <div className="mt-2">
                <Button variant="outline" disabled={loading} asChild>
                  <Link href="/login">Back to Login</Link>
                </Button>
              </div>
            </CardHeader>
            <form onSubmit={handleSendOtp}>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-lg">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setErrors(prev => ({ ...prev, email: null }))
                    }}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </CardContent>
              <CardFooter className="mt-6">
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold my-2">Verify OTP</CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>Enter the 6-digit OTP sent to <b>{email}</b></span>
                <Button variant="outline" onClick={handleResendOtp} disabled={cooldown > 0}>
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </Button>
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                <InputOTP id="otp" maxLength={6} onChange={(val) => {
                  setOtp(val)
                  setErrors(prev => ({ ...prev, otp: null }))
                }} disabled={loading} required>
                  <InputOTPGroup maxLength={6}>
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
                {errors.otp && <p className="text-sm text-red-500">{errors.otp}</p>}
              </CardContent>
              <CardFooter className="mt-6">
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-semibold my-2">Reset Password</CardTitle>
              <CardDescription>Set a new password for <b>{email}</b></CardDescription>
            </CardHeader>
            <form onSubmit={handleResetPassword}>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-lg">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setErrors(prev => ({ ...prev, password: null }))
                    }}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.password && Array.isArray(errors.password) && (
                  <ul className="text-sm text-red-500 space-y-1">
                    {errors.password.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-lg">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setErrors(prev => ({ ...prev, confirmPassword: null }))
                    }}
                    disabled={loading}
                    required
                  />
                </div>
                {errors.confirmPassword && Array.isArray(errors.confirmPassword) && (
                  <ul className="text-sm text-red-500 space-y-1">
                    {errors.confirmPassword.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
              <CardFooter className="mt-6">
                <Button type="submit" disabled={loading} className="w-full font-semibold">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  )
}
