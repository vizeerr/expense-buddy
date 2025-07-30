import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'

import { verifyUser } from '@/lib/auth/VerifyUser'
import { verifyGroup } from '@/lib/auth/VerifyGroup'


export async function GET(_, { params }) {
  try {
     const { success, user, response } = await verifyUser()
           if (!success) return response    
           
           const { id: groupId } = await params
           const userId = await user._id
           const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
           if (!groupSuccess) return groupResponse
       

    // 📦 Fetch all group expenses (not trashed)
    const expenses = await GroupExpense.find({
      groupId,
      trashed: { $ne: true }
    }).populate('paidBy', 'name email')

    const totalGroupAmount = expenses.reduce((sum, e) => sum + e.amount, 0) || 1

    const memberMap = {}

    expenses.forEach((e) => {
      if (!e.paidBy) return // skip if no paidBy (just in case)

      const key = e.paidBy._id.toString()
      if (!memberMap[key]) {
        memberMap[key] = {
            _id: e.paidBy._id,
            name: e.paidBy.name,
            email: e.paidBy.email,
          totalAmount: 0,
          expenseCount: 0,
        }
      }

      memberMap[key].totalAmount += e.amount
      memberMap[key].expenseCount += 1
    })

    const members = Object.values(memberMap).map(m => ({
      ...m,
      percentage: Number(((m.totalAmount / totalGroupAmount) * 100).toFixed(1)),
    }))

    return NextResponse.json({
      success: true,
      members,
    })

  } catch (err) {
    console.error('[GROUP_MEMBER_SUMMARY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
