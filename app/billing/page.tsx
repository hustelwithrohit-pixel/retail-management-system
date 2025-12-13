'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { formatCurrency, calculateGST } from '@/lib/utils'
import { Search, Plus, Minus, Trash2, UserPlus, ShoppingCart } from 'lucide-react'
import { InvoicePDF } from '@/components/invoices/InvoicePDF'

interface Product {
  id: string
  name: string
  price: number
  gstRate: number
  currentStock: number
}

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
  gstRate: number
}

interface Customer {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  gstin: string | null
}

export default function BillingPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [customerModal, setCustomerModal] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [customerGstin, setCustomerGstin] = useState('')
  const [discount, setDiscount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?isActive=true')
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price,
          gstRate: product.gstRate,
        },
      ])
    }
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId))
  }

  const calculateTotals = () => {
    let subtotal = 0
    let totalGst = 0

    cart.forEach((item) => {
      const itemSubtotal = item.price * item.quantity
      const gst = calculateGST(itemSubtotal, item.gstRate)
      subtotal += itemSubtotal
      totalGst += gst.totalGst
    })

    const discountAmount = parseFloat(discount) || 0
    const total = subtotal + totalGst - discountAmount

    return { subtotal, totalGst, discountAmount, total }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Cart is empty')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customer?.id,
          customerName: customer?.name || customerName || 'Walk-in Customer',
          customerPhone: customer?.phone || customerPhone,
          customerEmail: customer?.email || customerEmail,
          customerAddress: customer?.address || customerAddress,
          customerGstin: customer?.gstin || customerGstin,
          items: cart,
          discount: parseFloat(discount) || 0,
          paymentMethod,
          notes,
        }),
      })

      const invoice = await response.json()

      if (!response.ok) {
        alert(invoice.error || 'Failed to create invoice')
        return
      }

      // Reset form
      setCart([])
      setCustomer(null)
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setCustomerAddress('')
      setCustomerGstin('')
      setDiscount('')
      setNotes('')

      // Show success and redirect to invoice
      window.location.href = `/invoices/${invoice.id}`
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const searchCustomer = async (phone: string) => {
    if (!phone) return

    try {
      const response = await fetch(`/api/customers?search=${encodeURIComponent(phone)}`)
      const customers = await response.json()
      if (customers.length > 0) {
        setCustomer(customers[0])
        setCustomerName(customers[0].name)
        setCustomerPhone(customers[0].phone || '')
        setCustomerEmail(customers[0].email || '')
        setCustomerAddress(customers[0].address || '')
        setCustomerGstin(customers[0].gstin || '')
      }
    } catch (error) {
      console.error('Error searching customer:', error)
    }
  }

  const { subtotal, totalGst, discountAmount, total } = calculateTotals()
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.currentStock > 0 && search === '')
  )

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCustomerModal(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Customer
                </Button>
              </div>

              {customer && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <p className="font-medium text-blue-900">{customer.name}</p>
                  {customer.phone && (
                    <p className="text-sm text-blue-700">{customer.phone}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={product.currentStock === 0}
                    className="p-3 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <p className="font-medium text-sm">{product.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatCurrency(product.price)} | Stock: {product.currentStock}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
              </h2>

              <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                {cart.map((item) => {
                  const itemSubtotal = item.price * item.quantity
                  const gst = calculateGST(itemSubtotal, item.gstRate)
                  return (
                    <div
                      key={item.productId}
                      className="p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.productName}</p>
                          <p className="text-xs text-gray-600">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="p-1 bg-white rounded border"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="p-1 bg-white rounded border"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <span className="ml-auto text-sm font-semibold">
                          {formatCurrency(itemSubtotal + gst.totalGst)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {cart.length === 0 && (
                <p className="text-center text-gray-500 py-8">Cart is empty</p>
              )}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST:</span>
                  <span>{formatCurrency(totalGst)}</span>
                </div>
                <Input
                  label="Discount"
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="mb-2"
                />
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="bank">Bank Transfer</option>
                </select>
                <Input
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <Button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  className="w-full"
                >
                  {loading ? 'Processing...' : 'Checkout'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Modal
          isOpen={customerModal}
          onClose={() => setCustomerModal(false)}
          title="Customer Details"
        >
          <div className="space-y-4">
            <Input
              label="Phone"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value)
                if (e.target.value.length >= 10) {
                  searchCustomer(e.target.value)
                }
              }}
              placeholder="Search by phone"
            />
            <Input
              label="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <Input
              label="Address"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
            />
            <Input
              label="GSTIN"
              value={customerGstin}
              onChange={(e) => setCustomerGstin(e.target.value)}
            />
            <Button
              onClick={() => setCustomerModal(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </Modal>
      </AppLayout>
    </ProtectedRoute>
  )
}

