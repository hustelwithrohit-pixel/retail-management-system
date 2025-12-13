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

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        items: true,
      },
    })

    // Group by GST rate
    const gstSummary: Record<string, any> = {}

    invoices.forEach((invoice) => {
      invoice.items.forEach((item) => {
        const rate = item.gstRate.toString()
        if (!gstSummary[rate]) {
          gstSummary[rate] = {
            gstRate: item.gstRate,
            taxableAmount: 0,
            cgst: 0,
            sgst: 0,
            totalGst: 0,
          }
        }

        gstSummary[rate].taxableAmount += item.subtotal
        gstSummary[rate].cgst += item.cgst
        gstSummary[rate].sgst += item.sgst
        gstSummary[rate].totalGst += item.totalGst
      })
    })

    const summary = Object.values(gstSummary).map((item: any) => ({
      ...item,
      taxableAmount: Math.round(item.taxableAmount * 100) / 100,
      cgst: Math.round(item.cgst * 100) / 100,
      sgst: Math.round(item.sgst * 100) / 100,
      totalGst: Math.round(item.totalGst * 100) / 100,
    }))

    // Calculate totals
    const totals = invoices.reduce(
      (acc, inv) => ({
        subtotal: acc.subtotal + inv.subtotal,
        cgst: acc.cgst + inv.cgst,
        sgst: acc.sgst + inv.sgst,
        totalGst: acc.totalGst + inv.totalGst,
        total: acc.total + inv.total,
      }),
      {
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        totalGst: 0,
        total: 0,
      }
    )

    return NextResponse.json({
      summary,
      totals,
    })
  } catch (error) {
    console.error('Error generating GST report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

