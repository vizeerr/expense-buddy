import { NextResponse } from 'next/server'
import Group from '@/lib/models/Group'
import { verifyUser } from '../../../../lib/auth/VerifyUser'

export async function GET() {
  try {
     const { success, user, response } = await verifyUser()
      if (!success) return response    
            
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
