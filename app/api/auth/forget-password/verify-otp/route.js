import { NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

const schema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
})

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const result = schema.safeParse(body)

    if (!result.success) {
      const error = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, message: 'Validation error', error }, { status: 400 })
    }

    const { email, otp } = result.data

    const user = await User.findOne({ email })

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // Check OTP match
    if (user.forgetOtp !== otp) {
      return NextResponse.json({ success: false, message: 'Incorrect OTP' }, { status: 400 })
    }

    // Check expiry
    if (new Date() > new Date(user.forgetOtpExpiry)) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 })
    }

    // ✅ Set password reset verified flag
    user.passwordResetVerified = true
    user.passwordResetVerifiedAt = new Date()

    // 🔐 Clear OTP fields
    user.forgetOtp = undefined
    user.forgetOtpExpiry = undefined

    await user.save()

    return NextResponse.json({ success: true, message: 'OTP verified successfully' })
  } catch (err) {
    console.error('OTP verification error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
