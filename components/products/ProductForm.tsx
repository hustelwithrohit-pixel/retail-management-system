'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Product {
  id: string
  name: string
  sku: string | null
  description: string | null
  category: string | null
  price: number
  costPrice: number | null
  gstRate: number
  openingStock: number
  lowStockAlert: number | null
  overStockAlert: number | null
  unit: string
  barcode: string | null
}

interface ProductFormProps {
  product?: Product | null
  onSuccess: () => void
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    costPrice: '',
    gstRate: '0',
    openingStock: '0',
    lowStockAlert: '',
    overStockAlert: '',
    unit: 'pcs',
    barcode: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price.toString(),
        costPrice: product.costPrice?.toString() || '',
        gstRate: product.gstRate.toString(),
        openingStock: product.openingStock.toString(),
        lowStockAlert: product.lowStockAlert?.toString() || '',
        overStockAlert: product.overStockAlert?.toString() || '',
        unit: product.unit || 'pcs',
        barcode: product.barcode || '',
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const url = product
        ? `/api/products/${product.id}`
        : '/api/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku || undefined,
          description: formData.description || undefined,
          category: formData.category || undefined,
          price: parseFloat(formData.price),
          costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
          gstRate: parseFloat(formData.gstRate),
          openingStock: product ? undefined : parseFloat(formData.openingStock),
          lowStockAlert: formData.lowStockAlert
            ? parseFloat(formData.lowStockAlert)
            : undefined,
          overStockAlert: formData.overStockAlert
            ? parseFloat(formData.overStockAlert)
            : undefined,
          unit: formData.unit,
          barcode: formData.barcode || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save product')
        return
      }

      onSuccess()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Product Name *"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
        <Input
          label="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
        />
      </div>

      <Input
        label="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
        />
        <Input
          label="Barcode"
          value={formData.barcode}
          onChange={(e) =>
            setFormData({ ...formData, barcode: e.target.value })
          }
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Price *"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({ ...formData, price: e.target.value })
          }
          required
        />
        <Input
          label="Cost Price"
          type="number"
          step="0.01"
          value={formData.costPrice}
          onChange={(e) =>
            setFormData({ ...formData, costPrice: e.target.value })
          }
        />
        <Input
          label="GST Rate (%)"
          type="number"
          step="0.01"
          value={formData.gstRate}
          onChange={(e) =>
            setFormData({ ...formData, gstRate: e.target.value })
          }
        />
      </div>

      {!product && (
        <Input
          label="Opening Stock"
          type="number"
          step="0.01"
          value={formData.openingStock}
          onChange={(e) =>
            setFormData({ ...formData, openingStock: e.target.value })
          }
        />
      )}

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Unit"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        />
        <Input
          label="Low Stock Alert"
          type="number"
          step="0.01"
          value={formData.lowStockAlert}
          onChange={(e) =>
            setFormData({ ...formData, lowStockAlert: e.target.value })
          }
        />
        <Input
          label="Over Stock Alert"
          type="number"
          step="0.01"
          value={formData.overStockAlert}
          onChange={(e) =>
            setFormData({ ...formData, overStockAlert: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : product ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

