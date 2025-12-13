import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reminderSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['GENERAL', 'CUSTOMER']).default('GENERAL'),
  dueDate: z.string().optional(),
  customerId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const customerId = searchParams.get('customerId')

    const where: any = {}
    if (status) {
      where.status = status
    }
    if (type) {
      where.type = type
    }
    if (customerId) {
      where.customerId = customerId
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(reminders)
  } catch (error) {
    console.error('Error fetching reminders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const body = await request.json()
    const data = reminderSchema.parse(body)

    const reminder = await prisma.reminder.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        customerId: data.customerId || null,
      },
      include: {
        customer: true,
      },
    })

    return NextResponse.json(reminder)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating reminder:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

