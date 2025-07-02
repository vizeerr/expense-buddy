import { serialize } from 'cookie'
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({status:200},{ message: 'Logged out' })
  response.headers.set('Set-Cookie', serialize('authToken', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  }))
  return response
}
