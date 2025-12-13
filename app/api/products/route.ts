import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.number().positive(),
  costPrice: z.number().optional(),
  gstRate: z.number().min(0).max(100).default(0),
  openingStock: z.number().min(0).default(0),
  lowStockAlert: z.number().min(0).optional(),
  overStockAlert: z.number().min(0).optional(),
  unit: z.string().default('pcs'),
  barcode: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (category) {
      where.category = category
    }
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
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
    const data = productSchema.parse(body)

    // If SKU is provided, check for uniqueness
    if (data.sku) {
      const existing = await prisma.product.findUnique({
        where: { sku: data.sku },
      })
      if (existing) {
        return NextResponse.json(
          { error: 'SKU already exists' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.create({
      data: {
        ...data,
        currentStock: data.openingStock,
      },
    })

    // Create opening stock movement
    if (data.openingStock > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: 'OPENING',
          quantity: data.openingStock,
          previousStock: 0,
          newStock: data.openingStock,
          reason: 'Opening stock',
        },
      })
    }

    return NextResponse.json(product)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

