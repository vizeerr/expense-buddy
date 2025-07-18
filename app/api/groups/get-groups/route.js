import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id email')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    // ✅ Fetch only groups where user is owner or a member
    const groups = await Group.find({
      $or: [
        { owner: user._id },
        { 'members.user': user._id }
      ]
    })
      .populate('owner', 'name email') // optional: populate owner info
      .populate('members.user', 'name email') // populate members info
      .sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      groups,
    })
  } catch (err) {
    console.error('Fetch Groups Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
