import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import User from '@/lib/models/User'
import { z } from 'zod'

const GroupSchema = z.object({
  name: z.string()
  .min(3, 'Name must be at least 3 characters')
  .regex(/^[A-Za-z\s]+$/, 'Name cannot contain numbers or symbols'),
  description: z.string().optional(),
})

export async function POST(req) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('authToken')?.value

    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized: No token' }, { status: 401 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (err) {
      console.log(err);
      
      return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 401 })
    }

    const body = await req.json()
    const result = GroupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    await dbConnect()

    const user = await User.findOne({ email: decoded.email })
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 })
    }

    const group = new Group({
      name: result.data.name,
      description: result.data.description || '',
      owner: user._id,
      members: [
        {
          user: user._id,
          role: 'owner',
        }
      ]
    })

    await group.save()

    return NextResponse.json({
      success: true,
      message: 'Group created successfully',
      group
    })

  } catch (err) {
    console.error('Group Creation Error:', err)
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 })
  }
}
