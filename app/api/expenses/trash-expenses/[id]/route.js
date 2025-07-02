// app/api/expenses/delete-expenses/[id]/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import dbConnect from '@/lib/mongodb'
import Expense from '@/lib/models/Expense'

export async function DELETE(req, context) {
  const { id } = await context.params
  const cookieStore = await cookies()
  const token = cookieStore.get('authToken')?.value

  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  if (!token) {
    return NextResponse.json({ success: false, message: 'Unauthorized: No token provided' }, { status: 401 })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    await dbConnect()

    const trashedExpense = await Expense.findOneAndUpdate(
      { _id: id, userEmail: decoded.email },
      { trashed: true, trashedAt: new Date() },
      { new: true }
    )

    if (!trashedExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found or not authorized' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Expense moved to trash',
      expense: trashedExpense
    })
  } catch (err) {
    console.error('Trash Delete Error:', err)
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 })
  }
}
