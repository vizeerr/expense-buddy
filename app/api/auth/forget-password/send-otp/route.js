import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export async function POST(req) {
  try {
    await dbConnect()

    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Generate OTP and expiry (10 min)
    const forgetOtp = generateOTP()
    const forgetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    // Update user with OTP and expiry
    user.forgetOtp = forgetOtp
    user.forgetOtpExpiry = forgetOtpExpiry
    await user.save()

    // Send OTP via external API
    const scriptURL =
      'https://script.google.com/macros/s/AKfycbyShfo_vXfWxh3hK4miF0ldnL9ZvCV5UislilRTEAMWz6dSA9DrpJlIG1DNGjRdrrjy/exec'
    const apiKey = 'VIVEKBADBOY!@#$%^&*()1234567890'

    const response = await fetch(scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ email, otp: forgetOtp, type: 'forgot-password', apiKey }),
    })

    const sendResult = await response.json()
    if (sendResult.status !== 'success') {
      return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OTP sent' }, { status: 200 })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
