import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import mongoose from 'mongoose'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import User from '@/lib/models/User'

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
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.error('JWT Error:', err)
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    await dbConnect()

    // ✅ Step 2: Check if user still exists in DB
    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
    }

    // 🔐 Attempt to delete only if owned by user
    const deletedExpense = await Expense.findOneAndDelete({
      _id: id,
      userEmail: decoded.email,
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
