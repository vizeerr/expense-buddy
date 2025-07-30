import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Group from '@/lib/models/Group'
import { verifyUser } from '@/lib/auth/VerifyUser'
import { z } from 'zod'

const GroupSchema = z.object({
  name: z.string()
  .min(3, 'Name must be at least 3 characters')
  .regex(/^[A-Za-z\s]+$/, 'Name cannot contain numbers or symbols'),
  description: z.string().optional(),
})

export async function POST(req) {
  try {
      const { success, user, response } = await verifyUser()
               if (!success) return response    
          

    const body = await req.json()
    const result = GroupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json({ success: false, errors: result.error.flatten().fieldErrors }, { status: 400 })
    }

    await dbConnect()

   

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
