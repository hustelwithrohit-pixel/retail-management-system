'use client'

import { useEffect, useRef } from 'react'
import jsPDF from 'jspdf'

interface InvoiceItem {
  productName: string
  quantity: number
  price: number
  gstRate: number
  subtotal: number
  totalGst: number
  total: number
}

interface Invoice {
  id: string
  invoiceNumber: string
  customerName: string
  customerPhone: string | null
  customerEmail: string | null
  customerAddress: string | null
  customerGstin: string | null
  subtotal: number
  cgst: number
  sgst: number
  totalGst: number
  discount: number
  total: number
  createdAt: string
  items: InvoiceItem[]
}

interface InvoicePDFProps {
  invoice: Invoice
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  businessGstin?: string
}

export function InvoicePDF({
  invoice,
  businessName = 'Your Retail Store',
  businessAddress = '123 Main Street, City, State 12345',
  businessPhone = '+1234567890',
  businessEmail = 'store@example.com',
  businessGstin = 'GSTIN123456789',
}: InvoicePDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null)

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    // Header
    doc.setFontSize(20)
    doc.text(businessName, margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.text(businessAddress, margin, yPos)
    yPos += 5
    doc.text(`Phone: ${businessPhone} | Email: ${businessEmail}`, margin, yPos)
    yPos += 5
    doc.text(`GSTIN: ${businessGstin}`, margin, yPos)
    yPos += 15

    // Invoice Details
    doc.setFontSize(16)
    doc.text('TAX INVOICE', pageWidth - margin, yPos, { align: 'right' })
    yPos += 10

    doc.setFontSize(10)
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, {
      align: 'right',
    })
    yPos += 5
    doc.text(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`,
      pageWidth - margin,
      yPos,
      { align: 'right' }
    )
    yPos += 15

    // Customer Details
    doc.setFontSize(12)
    doc.text('Bill To:', margin, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.text(invoice.customerName, margin, yPos)
    yPos += 5
    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, margin, yPos)
      yPos += 5
    }
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, margin, yPos)
      yPos += 5
    }
    if (invoice.customerGstin) {
      doc.text(`GSTIN: ${invoice.customerGstin}`, margin, yPos)
      yPos += 5
    }
    yPos += 10

    // Items Table
    const tableTop = yPos
    doc.setFontSize(10)

    // Table Header
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, tableTop, pageWidth - 2 * margin, 8, 'F')
    doc.text('Item', margin + 2, tableTop + 5)
    doc.text('Qty', margin + 60, tableTop + 5)
    doc.text('Rate', margin + 80, tableTop + 5)
    doc.text('GST%', margin + 110, tableTop + 5)
    doc.text('Amount', pageWidth - margin - 2, tableTop + 5, { align: 'right' })

    yPos = tableTop + 8

    // Table Rows
    invoice.items.forEach((item) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = margin
      }

      doc.text(item.productName, margin + 2, yPos + 5)
      doc.text(item.quantity.toString(), margin + 60, yPos + 5)
      doc.text(item.price.toFixed(2), margin + 80, yPos + 5)
      doc.text(`${item.gstRate}%`, margin + 110, yPos + 5)
      doc.text(item.total.toFixed(2), pageWidth - margin - 2, yPos + 5, {
        align: 'right',
      })
      yPos += 8
    })

    yPos += 5

    // Totals
    const totalsX = pageWidth - margin - 60
    doc.text('Subtotal:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.subtotal.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    doc.text('CGST:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.cgst.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    doc.text('SGST:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.sgst.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    if (invoice.discount > 0) {
      doc.text('Discount:', totalsX, yPos, { align: 'right' })
      doc.text(invoice.discount.toFixed(2), pageWidth - margin - 2, yPos, {
        align: 'right',
      })
      yPos += 5
    }

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Total:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.total.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 30
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('Thank you for your business!', pageWidth / 2, yPos, {
      align: 'center',
    })

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`)
  }

  return (
    <div ref={pdfRef} className="hidden">
      <button
        onClick={generatePDF}
        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
      >
        Download PDF
      </button>
    </div>
  )
}

export function useInvoicePDF() {
  const generatePDF = (
    invoice: Invoice,
    businessInfo: {
      name?: string
      address?: string
      phone?: string
      email?: string
      gstin?: string
    } = {}
  ) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    let yPos = margin

    // Header
    doc.setFontSize(20)
    doc.text(businessInfo.name || 'Your Retail Store', margin, yPos)
    yPos += 10

    doc.setFontSize(10)
    doc.text(businessInfo.address || '123 Main Street, City, State 12345', margin, yPos)
    yPos += 5
    doc.text(
      `Phone: ${businessInfo.phone || '+1234567890'} | Email: ${businessInfo.email || 'store@example.com'}`,
      margin,
      yPos
    )
    yPos += 5
    doc.text(`GSTIN: ${businessInfo.gstin || 'GSTIN123456789'}`, margin, yPos)
    yPos += 15

    // Invoice Details
    doc.setFontSize(16)
    doc.text('TAX INVOICE', pageWidth - margin, yPos, { align: 'right' })
    yPos += 10

    doc.setFontSize(10)
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, pageWidth - margin, yPos, {
      align: 'right',
    })
    yPos += 5
    doc.text(
      `Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`,
      pageWidth - margin,
      yPos,
      { align: 'right' }
    )
    yPos += 15

    // Customer Details
    doc.setFontSize(12)
    doc.text('Bill To:', margin, yPos)
    yPos += 7
    doc.setFontSize(10)
    doc.text(invoice.customerName, margin, yPos)
    yPos += 5
    if (invoice.customerAddress) {
      doc.text(invoice.customerAddress, margin, yPos)
      yPos += 5
    }
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, margin, yPos)
      yPos += 5
    }
    if (invoice.customerGstin) {
      doc.text(`GSTIN: ${invoice.customerGstin}`, margin, yPos)
      yPos += 5
    }
    yPos += 10

    // Items Table
    const tableTop = yPos
    doc.setFontSize(10)

    // Table Header
    doc.setFillColor(240, 240, 240)
    doc.rect(margin, tableTop, pageWidth - 2 * margin, 8, 'F')
    doc.text('Item', margin + 2, tableTop + 5)
    doc.text('Qty', margin + 60, tableTop + 5)
    doc.text('Rate', margin + 80, tableTop + 5)
    doc.text('GST%', margin + 110, tableTop + 5)
    doc.text('Amount', pageWidth - margin - 2, tableTop + 5, { align: 'right' })

    yPos = tableTop + 8

    // Table Rows
    invoice.items.forEach((item) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = margin
      }

      doc.text(item.productName, margin + 2, yPos + 5)
      doc.text(item.quantity.toString(), margin + 60, yPos + 5)
      doc.text(item.price.toFixed(2), margin + 80, yPos + 5)
      doc.text(`${item.gstRate}%`, margin + 110, yPos + 5)
      doc.text(item.total.toFixed(2), pageWidth - margin - 2, yPos + 5, {
        align: 'right',
      })
      yPos += 8
    })

    yPos += 5

    // Totals
    const totalsX = pageWidth - margin - 60
    doc.text('Subtotal:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.subtotal.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    doc.text('CGST:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.cgst.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    doc.text('SGST:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.sgst.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })
    yPos += 5

    if (invoice.discount > 0) {
      doc.text('Discount:', totalsX, yPos, { align: 'right' })
      doc.text(invoice.discount.toFixed(2), pageWidth - margin - 2, yPos, {
        align: 'right',
      })
      yPos += 5
    }

    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('Total:', totalsX, yPos, { align: 'right' })
    doc.text(invoice.total.toFixed(2), pageWidth - margin - 2, yPos, {
      align: 'right',
    })

    // Footer
    yPos = doc.internal.pageSize.getHeight() - 30
    doc.setFontSize(8)
    doc.setFont(undefined, 'normal')
    doc.text('Thank you for your business!', pageWidth / 2, yPos, {
      align: 'center',
    })

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`)
  }

  return { generatePDF }
}

