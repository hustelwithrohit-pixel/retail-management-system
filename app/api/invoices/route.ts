import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { generateInvoiceNumber, calculateGST } from '@/lib/utils'
import { z } from 'zod'

const invoiceItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
  gstRate: z.number().min(0).max(100),
})

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  customerAddress: z.string().optional(),
  customerGstin: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1),
  discount: z.number().min(0).default(0),
  paymentMethod: z.string().default('cash'),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const customerId = searchParams.get('customerId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const where: any = {}
    if (customerId) {
      where.customerId = customerId
    }
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          customer: true,
        },
      }),
      prisma.invoice.count({ where }),
    ])

    return NextResponse.json({
      invoices,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Error fetching invoices:', error)
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
    const data = invoiceSchema.parse(body)

    // Calculate totals
    let subtotal = 0
    let totalCgst = 0
    let totalSgst = 0
    let totalGst = 0

    const invoiceItems = data.items.map((item) => {
      const itemSubtotal = item.price * item.quantity
      const gst = calculateGST(itemSubtotal, item.gstRate)
      const itemTotal = itemSubtotal + gst.totalGst

      subtotal += itemSubtotal
      totalCgst += gst.cgst
      totalSgst += gst.sgst
      totalGst += gst.totalGst

      return {
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        gstRate: item.gstRate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        totalGst: gst.totalGst,
        subtotal: itemSubtotal,
        total: itemTotal,
      }
    })

    const total = subtotal + totalGst - data.discount

    // Create or find customer
    let customerId = data.customerId
    if (!customerId && data.customerPhone) {
      let customer = await prisma.customer.findFirst({
        where: { phone: data.customerPhone },
      })

      if (!customer && data.customerName) {
        customer = await prisma.customer.create({
          data: {
            name: data.customerName,
            phone: data.customerPhone,
            email: data.customerEmail,
            address: data.customerAddress,
            gstin: data.customerGstin,
          },
        })
      }

      if (customer) {
        customerId = customer.id
      }
    }

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        customerId,
        customerName: data.customerName || 'Walk-in Customer',
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        customerGstin: data.customerGstin,
        subtotal,
        cgst: totalCgst,
        sgst: totalSgst,
        totalGst,
        discount: data.discount,
        total,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        items: {
          create: invoiceItems,
        },
      },
      include: {
        items: true,
        customer: true,
      },
    })

    // Update stock and create stock movements
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      })

      if (product) {
        const previousStock = product.currentStock
        const newStock = previousStock - item.quantity

        await prisma.product.update({
          where: { id: item.productId },
          data: { currentStock: newStock },
        })

        await prisma.stockMovement.create({
          data: {
            productId: item.productId,
            invoiceId: invoice.id,
            type: 'SALE',
            quantity: -item.quantity,
            previousStock,
            newStock,
            reason: `Sale - Invoice ${invoice.invoiceNumber}`,
          },
        })
      }
    }

    return NextResponse.json(invoice)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

