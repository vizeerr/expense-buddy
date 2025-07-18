import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcrypt'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const RESET_PASSWORD_EXPIRY_MINUTES = 15

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[a-z]/, 'At least one lowercase letter')
    .regex(/[A-Z]/, 'At least one uppercase letter')
    .regex(/\d/, 'At least one number')
    .regex(/[^a-zA-Z0-9]/, 'At least one special character'),
})

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const error = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, message: 'Validation failed', error }, { status: 400 })
    }

    const { email, password } = result.data

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (!user.passwordResetVerified || !user.passwordResetVerifiedAt) {
      return NextResponse.json({ success: false, message: 'OTP verification required' }, { status: 403 })
    }

    const now = new Date()
    const verifiedAt = new Date(user.passwordResetVerifiedAt)
    const diffMinutes = (now - verifiedAt) / 1000 / 60

    if (diffMinutes > RESET_PASSWORD_EXPIRY_MINUTES) {
      return NextResponse.json({
        success: false,
        message: 'OTP verification expired. Please verify OTP again.',
      }, { status: 403 })
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.passwordResetVerified = undefined
    user.passwordResetVerifiedAt = undefined

    await user.save()

    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    console.error('Password reset error:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
