import { NextRequest, NextResponse } from 'next/server'
import { requireOwner } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { createUser, getUserByEmail } from '@/lib/auth'
import { z } from 'zod'

const staffSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    await requireOwner()
    const staff = await prisma.user.findMany({
      where: {
        role: 'STAFF',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireOwner()
    const body = await request.json()
    const data = staffSchema.parse(body)

    const existingUser = await getUserByEmail(data.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const user = await createUser(data.email, data.password, data.name, 'STAFF')

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating staff:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

