import { serialize } from 'cookie'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out' },
    { status: 200 }
  )

  response.headers.set('Set-Cookie', serialize('authToken', '', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(0), // Expire immediately
  }))

  return response
}
