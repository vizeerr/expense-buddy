import { z } from 'zod'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import {sendMail} from '@/utils/sendMail'

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const schema = z.object({
  email: z.string().email('Invalid email'),
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

    const { email } = result.data

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const otp = generateOTP()
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    user.forgetOtp = otp
    user.forgetOtpExpiry = expiry
    await user.save()

    const emailSent = await sendMail('forgot-password', { email, otp })

    if (!emailSent) {
      return NextResponse.json({ success: false, message: 'Failed to send OTP' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' }, { status: 200 })
  } catch (err) {
    console.error('OTP route error:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
