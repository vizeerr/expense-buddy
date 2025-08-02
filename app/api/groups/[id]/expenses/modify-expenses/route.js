import { NextResponse } from 'next/server'
import { z } from 'zod'
import User from '@/lib/models/User'
import GroupExpense from '@/lib/models/GroupExpense'
import { verifyGroup } from '../../../../../../lib/auth/VerifyGroup'
import { verifyUser } from '../../../../../../lib/auth/VerifyUser'

const GroupExpenseSchema = z.object({
  _id: z.string().min(1, 'Expense ID is required'),
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(25, "Max 25 characters"),

  description: z.string().max(200, "Max 200 characters").optional(),

  amount: z
    .string({ required_error: 'Amount is required' })
     .refine((val) => {
    const num = parseFloat(val)
    return !isNaN(num) && num > 0 && num <= 9999999.99
  }, {
    message: 'Amount must be a valid between 0 and 9999999.99',
  }),

  category: z
    .string({ required_error: 'Category is required' })
    .min(1, 'Category is required'),

  type: z
    .string({ required_error: 'Type is required' })
    .min(1, 'Type is required') // 🚫 catches empty string
    .refine((val) => ['credit', 'debit'].includes(val), {
      message: 'Invalid type',
    }),

  paymentMethod: z
    .string({ required_error: 'Payment method is required' })
    .min(1, 'Payment method  is required') // 🚫 catches empty string
    .refine((val) => ['upi', 'cash', 'card', 'netbanking', 'other'].includes(val), {
      message: 'Invalid payment method',
    }),

   date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  time: z
    .string({ required_error: 'Time is required' })
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: 'Invalid time format (HH:mm)',
    }),
    splitBetween: z
    .array(z.string().min(1, 'Invalid user id'))
    .min(1, 'At least one member must be selected'),
  paidBy: z.string().min(1, 'PaidBy is required'),
  groupId: z.string().min(1, 'PaidBy is required'),
})

export async function PUT(req) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response    
       
    const userId = await user._id
       

    const body = await req.json()
    const result = GroupExpenseSchema.safeParse(body)

 
if (!result.success) {
  const errors = result.error.flatten().fieldErrors
  return NextResponse.json({ success: false, errors }, { status: 400 })
}

    const {
      _id,
      title,
      description,
      amount,
      category,
      type,
      paymentMethod,
      paidBy,
      groupId,
      date,
      time,
      splitBetween
    } = result.data

    const datetime = new Date(`${date}T${time}:00`)
    if (isNaN(datetime.getTime())) {
      return NextResponse.json({ success: false, message: 'Invalid datetime' }, { status: 400 })
    }

    const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
      if (!groupSuccess) return groupResponse
   

    const paidByUser = await User.findById(paidBy)

    if (!paidByUser) {
      return NextResponse.json({ success: false, message: 'Invalid paidBy user' }, { status: 400 })
    }

    const expense = await GroupExpense.findById(_id)
    if (!expense) {
      return NextResponse.json({ success: false, message: 'Expense not found' }, { status: 404 })
    }

    // ✅ Check if group has changed
    const groupChanged = !expense.groupId.equals(groupId)

    // ✅ Update all fields
    expense.title = title
    expense.description = description || ''
    expense.amount = Number(amount)
    expense.category = category
    expense.type = type
    expense.paymentMethod = paymentMethod
    expense.paidBy = paidBy
    expense.datetime = datetime
    expense.groupId = groupId // ✅ assign new group if changed
    expense.splitBetween = splitBetween
    await expense.save()

    return NextResponse.json({
      success: true,
      message: groupChanged
        ? 'Group expense updated and moved to new group'
        : 'Group expense updated successfully',
      expense,
    })
  } catch (err) {
    console.error('[GROUP_EXPENSE_MODIFY_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
