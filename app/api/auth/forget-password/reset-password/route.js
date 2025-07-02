// /api/auth/reset-password/route.js
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const RESET_PASSWORD_EXPIRY_MINUTES = 15

export async function POST(req) {
  try {
    await dbConnect()

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and new password are required' },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.passwordResetVerified || !user.passwordResetVerifiedAt) {
      return NextResponse.json(
        { success: false, message: 'OTP verification required' },
        { status: 403 }
      )
    }

    const now = new Date()
    const verifiedAt = new Date(user.passwordResetVerifiedAt)
    const diffMinutes = (now - verifiedAt) / 1000 / 60

    if (diffMinutes > RESET_PASSWORD_EXPIRY_MINUTES) {
      return NextResponse.json(
        { success: false, message: 'OTP verification expired. Please verify OTP again.' },
        { status: 403 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Update the password and reset verification fields
    user.password = hashedPassword
    user.passwordResetVerified = undefined
    user.passwordResetVerifiedAt = undefined
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
