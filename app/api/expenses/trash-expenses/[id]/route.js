// app/api/expenses/delete-expenses/[id]/route.js
import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import mongoose from 'mongoose'
import { verifyUser } from '../../../../../lib/auth/VerifyUser'

export async function DELETE(req, { params }) {
  try{
    const { success, user, response } = await verifyUser()
    if (!success) return response    
           
  const { id } = await params
 
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

    if (!mongoose.Types.ObjectId.isValid(id)) {
          return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
        }

    const trashedExpense = await Expense.findOneAndUpdate(
      { _id: id, userEmail: user.email },
      { trashed: true, trashedAt: new Date() },
      { new: true }
    )

    if (!trashedExpense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
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
