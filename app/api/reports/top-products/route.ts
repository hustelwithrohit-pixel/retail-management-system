import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
      },
    })

    // Aggregate by product
    const productStats: Record<string, any> = {}

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const productId = item.productId
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            productName: item.productName,
            quantity: 0,
            revenue: 0,
            count: 0,
          }
        }

        productStats[productId].quantity += item.quantity
        productStats[productId].revenue += item.total
        productStats[productId].count += 1
      })
    })

    const topProducts = Object.values(productStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, limit)

    return NextResponse.json(topProducts)
  } catch (error) {
    console.error('Error generating top products report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

