import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({
        user: null,
        authenticated: false,
        message: 'Authentication token missing'
      }, { status: 401 })
    }

    // Decode and verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err);
      return NextResponse.json({
        user: null,
        authenticated: false,
        message: 'Invalid or expired token'
      }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: decoded.email })

    if (!user || !user.isActive) {
      return NextResponse.json({
        user: null,
        authenticated: false,
        message: 'User does not exist or is inactive'
      }, { status: 401 })
    }

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    return NextResponse.json({
      authenticated: true,
      user: safeUser
    }, { status: 200 })

  } catch (error) {
    console.error('[GET /api/auth/me]', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      message: 'Server error'
    }, { status: 500 })
  }
}
