import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

// DELETE /api/expenses/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = params
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    await dbConnect()

    // 🗑️ Attempt to find and delete the expense
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userEmail: decoded.email, // Ensure user can only delete their own expense
    })

    if (!deletedExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found or not authorized' }, { status: 404 })
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
