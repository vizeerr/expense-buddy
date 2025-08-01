import { NextResponse } from 'next/server'
import GroupExpense from '@/lib/models/GroupExpense'
import { verifyUser } from '../../../../../../lib/auth/VerifyUser'
import { verifyGroup } from '../../../../../../lib/auth/VerifyGroup'

export async function GET(req, { params }) {
  try {
    const { success, user, response } = await verifyUser()
    if (!success) return response    
    
    const { id: groupId } = await params
    const userId = await user._id
    const { success:groupSuccess, response:groupResponse } = await verifyGroup(groupId,userId )
    if (!groupSuccess) return groupResponse

    // 🔎 Extract filters from query params
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const paymentMethod = searchParams.get('paymentMethod') || ''
    const trashed = searchParams.get('trashed') === 'true'
    const paidBy = searchParams.get('paidBy') || ''
    const addedBy = searchParams.get('addedBy') || ''
    
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')


    // 🧠 Build dynamic query
    const query = {
      groupId,
      trashed,
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ]
    }

    if (type) query.type = type
    if (category) query.category = category
    if (paymentMethod) query.paymentMethod = paymentMethod
    if (paidBy) query.paidBy = paidBy
    if (addedBy) query.addedBy = addedBy
    if (fromDate || toDate) {
      query.datetime = {}
      if (fromDate) query.datetime.$gte = new Date(fromDate)
      if (toDate) query.datetime.$lte = new Date(toDate)
    }

    const skip = (page - 1) * limit

    const expenses = await GroupExpense.find(query)
      .sort({ datetime: -1 })
      .skip(skip)
      .limit(limit)
      .populate('addedBy', 'name email')
      .populate('paidBy', 'name email')
      .populate('splitBetween', 'name email')


    const total = await GroupExpense.countDocuments(query)

    return NextResponse.json({
      success: true,
      expenses,
      pagination: {
        page,
        limit,
        hasMore: skip + expenses.length < total,
      }
    })
  } catch (err) {
    console.error('[GROUP_EXPENSES_FETCH_ERROR]', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
