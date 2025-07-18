import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { serialize } from 'cookie'
import { NextResponse } from 'next/server'

import dbConnect from '@/lib/mongodb'  // your dbConnect
import User from '@/lib/models/User'       // your User model

const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must include a lowercase letter')
    .regex(/[A-Z]/, 'Password must include an uppercase letter')
    .regex(/\d/, 'Password must include a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must include a special character'),
})

export async function POST(req) {
  try {
    await dbConnect()
    const body = await req.json()
    const result = LoginSchema.safeParse(body)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    const { email, password } = result.data

    const user = await User.findOne({ email }).lean()

    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    if (!user.emailVerified) {
      return NextResponse.json({
        success: false,
        message: 'Email not verified. Please verify before logging in.',
      }, { status: 403 })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 })
    }

    const tokenPayload = {
      email: user.email,
      name: user.name,
      role: user.role,
      _id:user._id,
    }

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        name: user.name,
        email: user.email,
        _id:user._id,
        role: user.role,
      },
    })

    response.headers.set(
      'Set-Cookie',
      serialize('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    )

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
