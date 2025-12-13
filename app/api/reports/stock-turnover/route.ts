import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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

    // Get all products
    const products = await prisma.product.findMany({
      where: { isActive: true },
    })

    // Get sales for the period
    const salesMovements = await prisma.stockMovement.findMany({
      where: {
        ...where,
        type: 'SALE',
      },
    })

    // Calculate turnover for each product
    const turnoverData = products.map((product) => {
      const productSales = salesMovements
        .filter((m) => m.productId === product.id)
        .reduce((sum, m) => sum + Math.abs(m.quantity), 0)

      const averageStock = product.openingStock // Simplified - could use average of daily stock
      const turnover = averageStock > 0 ? productSales / averageStock : 0
      const daysToTurnover = turnover > 0 ? 365 / turnover : null

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock: product.currentStock,
        openingStock: product.openingStock,
        salesQuantity: productSales,
        turnover: Math.round(turnover * 100) / 100,
        daysToTurnover: daysToTurnover ? Math.round(daysToTurnover) : null,
      }
    })

    return NextResponse.json(turnoverData)
  } catch (error) {
    console.error('Error generating stock turnover report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

