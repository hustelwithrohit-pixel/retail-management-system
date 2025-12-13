'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { formatCurrency } from '@/lib/utils'
import {
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  Bell,
  ShoppingCart,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  todaySales: number
  todayCount: number
  monthSales: number
  lowStockCount: number
  overStockCount: number
  pendingReminders: number
  totalProducts: number
  totalCustomers: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </AppLayout>
    )
  }

  if (!stats) {
    return (
      <AppLayout>
        <div className="text-red-500">Error loading dashboard</div>
      </AppLayout>
    )
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Sales"
            value={formatCurrency(stats.todaySales)}
            subtitle={`${stats.todayCount} invoices`}
            icon={TrendingUp}
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="This Month"
            value={formatCurrency(stats.monthSales)}
            subtitle="Total revenue"
            icon={ShoppingCart}
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Products"
            value={stats.totalProducts.toString()}
            subtitle="Active items"
            icon={Package}
            color="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers.toString()}
            subtitle="Total registered"
            icon={Users}
            color="text-orange-600"
            bgColor="bg-orange-50"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AlertCard
            title="Stock Alerts"
            lowStock={stats.lowStockCount}
            overStock={stats.overStockCount}
            link="/products"
          />
          <RemindersCard
            count={stats.pendingReminders}
            link="/reminders"
          />
        </div>

        <QuickActions />
      </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string
  value: string
  subtitle: string
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  )
}

function AlertCard({
  title,
  lowStock,
  overStock,
  link,
}: {
  title: string
  lowStock: number
  overStock: number
  link: string
}) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <Link
          href={link}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {lowStock > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">
                {lowStock} products low in stock
              </p>
              <p className="text-sm text-yellow-600">
                Consider restocking soon
              </p>
            </div>
          </div>
        )}
        {overStock > 0 && (
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">
                {overStock} products overstocked
              </p>
              <p className="text-sm text-blue-600">Review inventory levels</p>
            </div>
          </div>
        )}
        {lowStock === 0 && overStock === 0 && (
          <p className="text-gray-500 text-sm">No stock alerts</p>
        )}
      </div>
    </div>
  )
}

function RemindersCard({ count, link }: { count: number; link: string }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Reminders</h3>
        <Link
          href={link}
          className="text-sm text-primary-600 hover:text-primary-700"
        >
          View all
        </Link>
      </div>
      <div className="flex items-center space-x-3">
        <Bell className="w-8 h-8 text-primary-600" />
        <div>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
          <p className="text-sm text-gray-600">Pending reminders</p>
        </div>
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/billing"
          className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary-600" />
          <p className="text-sm font-medium">New Sale</p>
        </Link>
        <Link
          href="/products/new"
          className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <Package className="w-6 h-6 mx-auto mb-2 text-primary-600" />
          <p className="text-sm font-medium">Add Product</p>
        </Link>
        <Link
          href="/customers/new"
          className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <Users className="w-6 h-6 mx-auto mb-2 text-primary-600" />
          <p className="text-sm font-medium">Add Customer</p>
        </Link>
        <Link
          href="/reports"
          className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
        >
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary-600" />
          <p className="text-sm font-medium">View Reports</p>
        </Link>
      </div>
    </div>
  )
}

