import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'
import { verifyUser } from '../../../../../../../lib/auth/VerifyUser'
import { verifyGroup } from '../../../../../../../lib/auth/VerifyGroup'

export async function DELETE(req, { params }) {
  try {

     const { success, user, response } = await verifyUser()
        if (!success) return response    
        
        const { id:groupId, expenseId } = await params
        const userId = await user._id
        const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
        if (!groupSuccess) return groupResponse
        

    const trashedExpense = await GroupExpense.findOneAndUpdate(
      { _id: expenseId, groupId },
      { trashed: true, trashedAt: new Date() },
      { new: true }
    )

    if (!trashedExpense) {
      return NextResponse.json({ success: false, message: 'Group expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Group expense moved to trash',
      expense: trashedExpense
    })

  } catch (err) {
    console.error('[GROUP_TRASH_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
