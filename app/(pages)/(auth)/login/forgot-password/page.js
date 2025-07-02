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

export default function ForgetPasswordPage() {
  const [step, setStep] = useState(1) // 1: email, 2: otp, 3: reset password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const router = useRouter()

  // Cooldown timer for resend OTP button
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

  const validateEmail = () => {
    if (!email) {
      toast.error('Email is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Invalid email format')
      return false
    }
    return true
  }

  const validateOtp = () => {
    const otpRegex = /^[0-9]{6}$/
    if (!otpRegex.test(otp)) {
      toast.error('Enter a valid 6-digit OTP')
      return false
    }
    return true
  }

  const validatePasswords = () => {
     const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])[A-Za-z\d@$!%*?&#^()\-_=+]{8,}$/

    if (!password || !confirmPassword) {
      toast.error('Both password fields are required')
      return false
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return false
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return false
    }
    
    if (!strongPasswordRegex.test(password)) {
        toast.error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character')
        return false
      }

    return true
  }

  // Step 1: Send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault()
    if (!validateEmail()) return

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/login/forgot-password/send-otp', { email })
      if (res.status === 200) {
        toast.success('OTP sent to your email')
        setStep(2)
        setCooldown(60)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!validateOtp()) return

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/login/forgot-password/verify-otp', { email, otp })
      if (res.status === 200) {
        toast.success('OTP verified! You can reset your password now.')
        setStep(3)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!validatePasswords()) return

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/login/forgot-password/reset-password', { email, password })
      if (res.status === 200) {
        toast.success('Password reset successfully! Please login.')
        router.push('/login')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Password reset failed')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0) return
    try {
      const res = await axios.post('/api/auth/login/forgot-password/send-otp', { email })
      if (res.status === 200) {
        toast.success('OTP resent to your email')
        setCooldown(60)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to resend OTP')
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
                <Button variant="outline" asChild>
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
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
                <InputOTP id="otp" maxLength={6} value={otp} onChange={setOtp} required>
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
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-lg">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
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
