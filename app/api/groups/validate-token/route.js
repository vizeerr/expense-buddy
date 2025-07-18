import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'

export async function POST(req) {
  try {
    const { token } = await req.json()
    if (!token) {
      return NextResponse.json({ success: false, message: 'Token is required' }, { status: 400 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
        console.log(err);
        
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 400 })
    }

    await dbConnect()

    const group = await Group.findById(decoded.groupId).select('name')
    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, groupId: group._id, groupName: group.name })
  } catch (err) {
    console.error('[INVITE_VALIDATE_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
