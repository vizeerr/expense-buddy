import Group from '@/lib/models/Group'
import { NextResponse } from 'next/server'

export async function verifyGroup(groupId, userId) {
  // 🧠 Check Group existence
  const group = await Group.findById(groupId).lean()
  if (!group) {
    return {
      success: false,
      response: NextResponse.json({ success: false, message: 'Group not found' }, { status: 404 })
    }
  }

   const isMember = group.owner.equals(userId) || group.members.some(m => m.user.equals(userId))
      if (!isMember) {
        return NextResponse.json({ success: false, message: 'Not a group member' }, { status: 403 })
      }

  // ✅ Valid
  return { success: true, group }
}
