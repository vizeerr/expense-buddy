import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'
import { verifyUser } from '@/lib/auth/VerifyUser'
import { verifyGroup } from '@/lib/auth/VerifyGroup'

export async function GET(_, { params }) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response

    const { id: groupId } = await params
    const userId = user._id

    const { success: groupSuccess, response: groupResponse } = await verifyGroup(groupId, userId)
    if (!groupSuccess) return groupResponse

    const expenses = await GroupExpense.find({
      groupId,
      trashed: { $ne: true }
    })
    .populate('paidBy', '_id name email')
    .populate('splitBetween', '_id name email')

    const balances = {} // { userId: { user, balance: number } }

    for (const expense of expenses) {
      const paidBy = expense.paidBy?._id?.toString()
      const amount = expense.amount || 0
      const splitBetween = expense.splitBetween?.map(u => u._id.toString()) || []

      const sharePerUser = amount / splitBetween.length

      // 1. Credit the payer
      if (!balances[paidBy]) {
        balances[paidBy] = { user: expense.paidBy, balance: 0 }
      }
      balances[paidBy].balance += amount

      // 2. Debit each splitBetween user
      for (const userId of splitBetween) {
        if (!balances[userId]) {
          const userObj = expense.splitBetween.find(u => u._id.toString() === userId)
          balances[userId] = { user: userObj, balance: 0 }
        }
        balances[userId].balance -= sharePerUser
      }
    }

    // Convert balances into sorted creditors and debtors
    const creditors = []
    const debtors = []

    for (const userId in balances) {
      const entry = balances[userId]
      const roundedBalance = Math.round(entry.balance * 100) / 100
      if (roundedBalance > 0) creditors.push({ ...entry, balance: roundedBalance })
      else if (roundedBalance < 0) debtors.push({ ...entry, balance: roundedBalance })
    }

    // Settlement Algorithm
    const settlements = []

    creditors.sort((a, b) => b.balance - a.balance)
    debtors.sort((a, b) => a.balance - b.balance) // more negative first

    for (const debtor of debtors) {
      let owe = -debtor.balance

      for (const creditor of creditors) {
        if (owe === 0) break
        if (creditor.balance === 0) continue

        const pay = Math.min(owe, creditor.balance)

        settlements.push({
          from: {
            _id: debtor.user._id,
            name: debtor.user.name,
            email: debtor.user.email,
          },
          to: {
            _id: creditor.user._id,
            name: creditor.user.name,
            email: creditor.user.email,
          },
          amount: Math.round(pay * 100) / 100
        })

        creditor.balance -= pay
        owe -= pay
      }
    }

    return NextResponse.json({
      success: true,
      settlements
    })

  } catch (err) {
    console.error('[SETTLEMENT_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
