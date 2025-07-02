// /api/auth/verify-otp.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb' // Connect to MongoDB using Mongoose
import User from '@/lib/models/User' // Adjust this path to match your file structure

export async function POST(req) {
  try {
    await dbConnect()

    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 })
    }

    const otpRegex = /^[0-9]{6}$/
    if (!otpRegex.test(otp)) {
      return NextResponse.json({ success: false, message: 'Invalid OTP format' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (user.verifyOtp !== otp) {
      return NextResponse.json({ success: false, message: 'Incorrect OTP' }, { status: 400 })
    }

    if (new Date() > user.verifyOtpExpiry) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 })
    }

    // Mark user as verified and clean up OTP fields
    user.emailVerified = true
    user.verifyOtp = undefined
    user.verifyOtpExpiry = undefined
    await user.save()

    // Send welcome email or notification
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyShfo_vXfWxh3hK4miF0ldnL9ZvCV5UislilRTEAMWz6dSA9DrpJlIG1DNGjRdrrjy/exec'
    const apiKey = "VIVEKBADBOY!@#$%^&*()1234567890"

    const res = await fetch(scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        email,
        type: 'welcome',
        apiKey
      })
    })

    await res.json()

    return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
