// /api/auth/resend-otp.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb' // Ensure you have a db connection util
import User from '@/lib/models/User' // Update this path based on your file structure

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export async function POST(req) {
  try {
    await dbConnect() // Ensure Mongoose is connected

    const { email } = await req.json()
    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 })

    const user = await User.findOne({ email })
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 })

    const otp = generateOTP()
    const verifyOtpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    user.verifyOtp = otp
    user.verifyOtpExpiry = verifyOtpExpiry
    await user.save()

    // Send OTP via external API
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyShfo_vXfWxh3hK4miF0ldnL9ZvCV5UislilRTEAMWz6dSA9DrpJlIG1DNGjRdrrjy/exec'
    const apiKey = "VIVEKBADBOY!@#$%^&*()1234567890"

    const response = await fetch(scriptURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ email, otp, type: 'resend otp', apiKey })
    })

    const sendResult = await response.json()
    if (sendResult.status !== 'success') {
      return NextResponse.json({ message: 'Failed to resend OTP' }, { status: 500 })
    }

    return NextResponse.json({ message: 'OTP resent' }, { status: 200 })

  } catch (err) {
    console.error('Error resending OTP:', err)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
