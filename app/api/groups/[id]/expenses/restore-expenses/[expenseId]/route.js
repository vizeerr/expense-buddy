import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'
import { verifyUser } from '../../../../../../../lib/auth/VerifyUser'
import { verifyGroup } from '../../../../../../../lib/auth/VerifyGroup'

export async function PUT(req, { params }) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response    
    
    const { id:groupId, expenseId:id } = await params
    const userId = await user._id
    const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
    if (!groupSuccess) return groupResponse
    
    const restoredExpense = await GroupExpense.findOneAndUpdate(
      { _id: id, groupId },
      { trashed: false, trashedAt: null },
      { new: true }
    )

    if (!restoredExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Group expense restored successfully',
      expense: restoredExpense
    }, { status: 200 })
  } catch (err) {
    console.error('[GROUP_EXPENSE_RESTORE_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
