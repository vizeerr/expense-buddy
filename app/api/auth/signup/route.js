import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const SignupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export async function POST(req) {
  try {
    const body = await req.json()
    const result = SignupSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { name, email, password } = result.data
    const emailLower = email.toLowerCase()

    await dbConnect()

    const existingUser = await User.findOne({ email: emailLower })

    // ✅ Case 1: User exists and is already verified
    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Email already registered and verified. Please log in.'
      }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const verifyOtp = generateOTP()
    const verifyOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // ✅ Case 2: User exists but not verified → Update password + resend OTP
    if (existingUser && !existingUser.emailVerified) {
      existingUser.name = name.toLowerCase() // Optional: update name too
      existingUser.password = hashedPassword
      existingUser.verifyOtp = verifyOtp
      existingUser.verifyOtpExpiry = verifyOtpExpiry
      await existingUser.save()

      // Resend OTP
      const scriptURL = 'https://script.google.com/macros/s/AKfycbyShfo_vXfWxh3hK4miF0ldnL9ZvCV5UislilRTEAMWz6dSA9DrpJlIG1DNGjRdrrjy/exec'
      const apiKey = 'VIVEKBADBOY!@#$%^&*()1234567890'

      const resendOtpRes = await fetch(scriptURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          email: emailLower,
          otp: verifyOtp,
          type: 'resend-registration-password-update',
          apiKey
        })
      })

      const resendOtpResult = await resendOtpRes.json()
      if (resendOtpResult.status !== 'success') {
        return NextResponse.json({
          success: false,
          message: 'Failed to resend OTP. Please try again.'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Email already exists but was unverified. Password updated and OTP resent.'
      }, { status: 200 })
    }

    // ✅ Case 3: New user
    const newUser = new User({
      name: name.toLowerCase(),
      email: emailLower,
      password: hashedPassword,
      verifyOtp,
      verifyOtpExpiry,
      emailVerified: false,
    })

    await newUser.save()

    // Send OTP to new user
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyShfo_vXfWxh3hK4miF0ldnL9ZvCV5UislilRTEAMWz6dSA9DrpJlIG1DNGjRdrrjy/exec'
    const apiKey = 'VIVEKBADBOY!@#$%^&*()1234567890'

    const otpRes = await fetch(scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        email: emailLower,
        otp: verifyOtp,
        type: 'registration',
        apiKey
      })
    })

    const otpResult = await otpRes.json()
    if (otpResult.status !== 'success') {
      return NextResponse.json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email.'
    }, { status: 200 })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
