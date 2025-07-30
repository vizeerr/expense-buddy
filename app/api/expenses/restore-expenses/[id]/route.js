// app/api/expenses/restore-expense/[id]/route.js
import { NextResponse } from 'next/server'
import Expense from '@/lib/models/Expense'
import mongoose from 'mongoose'
import { verifyUser } from '../../../../../lib/auth/VerifyUser'

export async function PUT(req, { params }) {

  try{
  const { success, user, response } = await verifyUser()
  if (!success) return response    
         
  const {id} = await params
  if (!id) {
    return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 })
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ success: false, message: 'Invalid expense ID' }, { status: 400 })
      }
       
    const restoredExpense = await Expense.findOneAndUpdate(
      { _id: id, userEmail: user.email },
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
