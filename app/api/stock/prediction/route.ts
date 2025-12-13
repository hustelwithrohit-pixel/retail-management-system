import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const productId = searchParams.get('productId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get sales data for the product in the last N days
    const salesMovements = await prisma.stockMovement.findMany({
      where: {
        productId,
        type: 'SALE',
        createdAt: {
          gte: startDate,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate average daily sales
    const totalSales = Math.abs(
      salesMovements.reduce((sum, movement) => sum + movement.quantity, 0)
    )
    const averageDailySales = totalSales / days

    // Get current stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Predict days until stockout
    const daysUntilStockout =
      averageDailySales > 0 ? product.currentStock / averageDailySales : null

    // Predict stock needed for next 30/90 days
    const stockNeeded30 = averageDailySales * 30
    const stockNeeded90 = averageDailySales * 90

    return NextResponse.json({
      productId,
      currentStock: product.currentStock,
      averageDailySales: Math.round(averageDailySales * 100) / 100,
      daysUntilStockout: daysUntilStockout
        ? Math.round(daysUntilStockout)
        : null,
      stockNeeded30: Math.round(stockNeeded30),
      stockNeeded90: Math.round(stockNeeded90),
      period: days,
    })
  } catch (error) {
    console.error('Error calculating stock prediction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

