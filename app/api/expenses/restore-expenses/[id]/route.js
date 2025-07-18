// app/api/expenses/restore-expense/[id]/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'
import mongoose from 'mongoose'
import User from '@/lib/models/User'

export async function PUT(req, { params }) {

  const {id} = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value

  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
      }
  

  // Validate token presence
  if (!token) {
    return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
     const user = await User.findOne({ email: decoded.email })
      if (!user) {
        return NextResponse.json({ success: false, message: 'User no longer exists' }, { status: 401 })
      }

    await dbConnect()

    const restoredExpense = await Expense.findOneAndUpdate(
      { _id: id, userEmail: decoded.email },
      { trashed: false, trashedAt: null },
      { new: true }
    )

    if (!restoredExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense restored successfully',
    })
  } catch (err) {
    console.error('Restore Expense Error:', err)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
