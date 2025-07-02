'use client'

import React, { useState } from 'react'
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
export default function RegisterPage() {

  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    cpassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [showOTP, setShowOTP] = useState(false)
  const [otp, setOtp] = useState('')
  const [cooldown, setCooldown] = useState(0)
const router = useRouter()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const validateFields = () => {
    const { email, name, password, cpassword } = form

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()\-_=+])[A-Za-z\d@$!%*?&#^()\-_=+]{8,}$/

    if (!email || !name || !password || !cpassword) {
      toast.error('All fields are required')
      return false
    }

    if (!emailRegex.test(email)) {
      toast.error('Invalid email format')
      return false
    }

    if (name.length < 3) {
      toast.error('Name must be at least 3 characters')
      return false
    }

    if (!strongPasswordRegex.test(password)) {
        toast.error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character')
        return false
      }

    if (password !== cpassword) {
      toast.error('Passwords do not match')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateFields()) return

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/signup', {
        email: form.email,
        name: form.name,
        password: form.password
      })
      if(res.status==200){ 
        toast.success('OTP sent to your email')
        setShowOTP(true)
      }
    } catch (err) {
      console.error(err)
      const msg = err?.response?.data?.message || 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPSubmit = async (e) => {
    e.preventDefault()
    const otpRegex = /^[0-9]{6}$/; // exactly 6 alphanumeric chars

    if (!otpRegex.test(otp)) {
      toast.error('OTP must only contains numbers');
      return;
    }

    if (!otp || otp.length !== 6) {
      toast.error('Enter valid 6-digit OTP')
      return
    }

    try {
      setLoading(true)
      const res = await axios.post('/api/auth/signup/verify-otp', {
        email: form.email,
        otp
      })
      if(res.status==200){
        toast.success('Account registered successfully!')
        setShowOTP(false)
        setOtp('')
        setForm({ email: '', name: '', password: '', cpassword: '' })
        router.push('/login')
      }
      
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.message || 'OTP verification failed')
    } finally {
      setLoading(false)
    }
  }
  const handleResendOTP = async () => {
    try {
      const res = await axios.post('/api/auth/signup/resend-otp', {
        email: form.email,
      })

    if (res.status === 200) {
      toast.success('OTP resent successfully!')
      setCooldown(60)
      const interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  } catch (err) {
    console.error(err)
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

            <form onSubmit={handleSubmit} className=''>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-lg">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" value={form.email} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-lg">Name</Label>
                  <Input id="name" type="text" placeholder="Sam Altman" value={form.name} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-lg">Password</Label>
                  <Input id="password" type="password" value={form.password} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="cpassword" className="text-lg">Confirm Password</Label>
                  <Input id="cpassword" type="password" value={form.cpassword} onChange={handleChange} required />
                </div>
              </CardContent>

              <CardFooter className="mt-6">
                <Button type="submit" className="w-full font-semibold" disabled={loading}>
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
                <span>Enter the 6-digit OTP sent to: <br/> <b>{form.email}</b></span>
           
                <Button variant="outline" onClick={handleResendOTP}
                  disabled={cooldown > 0}>
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </Button>
           
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleOTPSubmit}>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  
                  <InputOTP id="otp" maxLength={6} value={otp} onChange={(value) => setOtp(value)} required>
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

                </div>
              </CardContent>

              <CardFooter className="py-4">
                <Button  type="submit" className="w-full font-semibold" disabled={loading}>
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
