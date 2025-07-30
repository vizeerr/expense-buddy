import { NextResponse } from 'next/server'
import { verifyUser } from '../../../../lib/auth/VerifyUser'
export async function GET() {
  try {
    const { success, user, response } = await verifyUser()
     if (!success) return response    
     

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
    console.error('User Auth', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      message: 'Server error'
    }, { status: 500 })
  }
}
