import { NextResponse } from 'next/server'
import Group from '@/lib/models/Group'
import { verifyUser } from '@/lib/auth/VerifyUser'
import { verifyGroup } from '@/lib/auth/VerifyGroup'

export async function GET(req, { params }) {
  try {
   
    const { success, user, response } = await verifyUser()
    if (!success) return response    
    
    const { id: groupId } = await params
    const userId = await user._id
    const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
    if (!groupSuccess) return groupResponse

    const group = await Group.findById(groupId)
      .populate('owner', 'name email')
      .populate('members.user', 'name email')
      .populate('joinRequests.user', 'name email')

    if (!group) {
      return NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
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
