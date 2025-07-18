import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { sendMail } from '@/utils/sendMail'

const SignupSchema = z.object({
  name: z.string()
  .min(3, 'Name must be at least 3 characters')
  .regex(/^[A-Za-z\s]+$/, 'Name cannot contain numbers or symbols'),
  email: z.string().email('Invalid email'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[a-z]/, 'Lowercase letter required')
    .regex(/[A-Z]/, 'Uppercase letter required')
    .regex(/\d/, 'Number required')
    .regex(/[^a-zA-Z0-9]/, 'Special character required'),
})

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

export async function POST(req) {
  try {
    await dbConnect()

    const body = await req.json()
    const result = SignupSchema.safeParse(body)

    if (!result.success) {
      const error = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, message: 'Validation error', error }, { status: 400 })
    }

    const { name, email, password } = result.data
    const emailLower = email.toLowerCase()

    const existingUser = await User.findOne({ email: emailLower })

    const hashedPassword = await bcrypt.hash(password, 10)
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

    if (existingUser) {
      // Case: User already verified
      if (existingUser.emailVerified) {
        return NextResponse.json({
          success: false,
          message: 'Email already registered',
        }, { status: 409 })
      }

      // Case: User not verified → update + resend OTP
      existingUser.name = name.toLowerCase()
      existingUser.password = hashedPassword
      existingUser.verifyOtp = otp
      existingUser.verifyOtpExpiry = otpExpiry
      await existingUser.save()

      const emailSent = await sendMail('registration', {
        email: emailLower,
        otp
      })

      if (!emailSent) {
        return NextResponse.json({
          success: false,
          message: 'Failed to signup'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Existing unverified account. OTP resent.'
      }, { status: 200 })
    }

    // Case: New user
    const newUser = new User({
      name: name.toLowerCase(),
      email: emailLower,
      password: hashedPassword,
      verifyOtp: otp,
      verifyOtpExpiry: otpExpiry,
      emailVerified: false,
    })

    await newUser.save()

    const emailSent = await sendMail('registration', {
      email: emailLower,
      otp
    })

    if (!emailSent) {
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
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
