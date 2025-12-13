import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'

const adjustStockSchema = z.object({
  productId: z.string(),
  quantity: z.number(),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN']),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth()
    const body = await request.json()
    const data = adjustStockSchema.parse(body)

    const product = await prisma.product.findUnique({
      where: { id: data.productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const previousStock = product.currentStock
    let newStock: number

    if (data.type === 'PURCHASE' || data.type === 'RETURN') {
      newStock = previousStock + data.quantity
    } else {
      // ADJUSTMENT can be positive or negative
      newStock = previousStock + data.quantity
    }

    if (newStock < 0) {
      return NextResponse.json(
        { error: 'Stock cannot be negative' },
        { status: 400 }
      )
    }

    // Update product stock
    await prisma.product.update({
      where: { id: data.productId },
      data: { currentStock: newStock },
    })

    // Create stock movement
    const movement = await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        previousStock,
        newStock,
        reason: data.reason || `${data.type} adjustment`,
        notes: data.notes,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(movement)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error adjusting stock:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

