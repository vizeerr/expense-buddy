import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function POST(req) {
  try {
    await dbConnect()

    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: 'Email and OTP are required' }, { status: 400 })
    }

    // Validate OTP format (6-digit number)
    const otpRegex = /^[0-9]{6}$/
    if (!otpRegex.test(otp)) {
      return NextResponse.json({ success: false, message: 'Invalid OTP format' }, { status: 400 })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (user.forgetOtp !== otp) {
      return NextResponse.json({ success: false, message: 'Incorrect OTP' }, { status: 400 })
    }

    if (new Date() > new Date(user.forgetOtpExpiry)) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 })
    }

    // Update user verification flags
    user.passwordResetVerified = true
    user.passwordResetVerifiedAt = new Date()
    user.forgetOtp = undefined
    user.forgetOtpExpiry = undefined

    await user.save()

    return NextResponse.json({ success: true, message: 'OTP verified successfully' })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
