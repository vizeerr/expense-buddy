import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const cookieStore = await cookies()
const token = cookieStore.get('authToken')?.value

    // 1. Check for token presence
    if (!token) {
      return NextResponse.json(
        { user: null, authenticated: false, message: 'Authentication token missing' },
        { status: 401 }
      )
    }

    // 2. Verify and decode token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { user: null, authenticated: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 3. Connect to DB
    await dbConnect()

    // 4. Fetch user from database
    const user = await User.findOne({ email: decoded.email })

    // 5. Check if user exists and is active
    if (!user || !user.isActive) {
      return NextResponse.json(
        { user: null, authenticated: false, message: 'User no longer exists or is inactive' },
        { status: 401 }
      )
    }

    // 6. Minimal data exposure - don't send password or sensitive info
    const safeUser = {
      email: user.email,
      name: user.name,
    }

    return NextResponse.json({
      user: safeUser,
      authenticated: true,
    }, { status: 200 })

  } catch (err) {
    console.error('Error in /me route:', err)
    return NextResponse.json(
      { user: null, authenticated: false, message: 'Server error' },
      { status: 500 }
    )
  }
}
