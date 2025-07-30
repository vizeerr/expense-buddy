import { NextResponse } from 'next/server'
import mongoose from 'mongoose'
import Expense from '@/lib/models/Expense'
import { verifyUser } from '@/lib/auth/VerifyUser'

// DELETE /api/expenses/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
    }
    // ✅ Step 1: Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
    }

    // 🍪 Get auth token from cookies
    const { success, user, response } = await verifyUser()
    if (!success) return response
  

    // 🔐 Attempt to delete only if owned by user
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userEmail: user.email,
    })

    if (!deletedExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense deleted successfully',
      deletedExpense,
    })

  } catch (err) {
      console.error('Expense Delete Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
