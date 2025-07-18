import { NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { sendMail } from '@/utils/sendMail'

const VerifySchema = z.object({
  email: z.string().email('Invalid email'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit number'),
})

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const result = VerifySchema.safeParse(body)

    if (!result.success) {
      const error = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, message: 'Validation error', error }, { status: 400 })
    }

    const { email, otp } = result.data

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, message: 'Email already verified' }, { status: 200 })
    }

    if (user.verifyOtp !== otp) {
      return NextResponse.json({ success: false, message: 'Incorrect OTP' }, { status: 400 })
    }

    if (new Date() > user.verifyOtpExpiry) {
      return NextResponse.json({ success: false, message: 'OTP expired' }, { status: 400 })
    }

    // ✅ Verify and clean up
    user.emailVerified = true
    user.verifyOtp = undefined
    user.verifyOtpExpiry = undefined
    await user.save()

    // ✅ Send welcome email
    const welcomeSent = await sendMail('welcome', { email })

    if (!welcomeSent) {
      return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 })
    }

    return NextResponse.json({ success: true, message: 'OTP verified successfully' }, { status: 200 })

  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
