import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'

export async function GET(req, { params }) {
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
      console.log(err);
      
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    const user = await User.findOne({ email: decoded.email }).select('_id email')
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const {id} = await params
    console.log(id);
    

    const group = await Group.findById(id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate('joinRequests.user', 'name email')

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    // ✅ Access check: must be owner or member
    const isAuthorized =
      group.owner._id.equals(user._id) ||
      group.members.some(m => m.user._id.equals(user._id))

    if (!isAuthorized) {
      return NextResponse.json({ success: false, message: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      group
    })

  } catch (err) {
    console.error('[GROUP_DETAIL_FETCH_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
