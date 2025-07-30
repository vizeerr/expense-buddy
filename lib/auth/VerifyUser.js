import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import User from '@/lib/models/User'
import dbConnect from '@/lib/mongodb'
export const verifyUser = async () => {
    
    
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value
  if (!token) {
      return {
      success: false,
      response: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }),
    }
}

let decoded
  try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        console.error('JWT Verification Error:', err)
        return {
            success: false,
            response: NextResponse.json({ success: false, message: 'Please Login !' }, { status: 401 }),
    }
}

await dbConnect()
  const user = await User.findOne({ email: decoded.email })
  if (!user) {
    return {
      success: false,
      response: NextResponse.json({ success: false, message: 'User not found' }, { status: 401 }),
    }
  }

  return { success: true, user }
}
