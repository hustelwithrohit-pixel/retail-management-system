'use client'

import { useEffect, useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Plus, Check, X, Bell } from 'lucide-react'

interface Reminder {
  id: string
  title: string
  description: string | null
  type: 'GENERAL' | 'CUSTOMER'
  status: 'PENDING' | 'COMPLETED'
  dueDate: string | null
  customer: {
    id: string
    name: string
  } | null
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'GENERAL' as 'GENERAL' | 'CUSTOMER',
    dueDate: '',
    customerId: '',
  })

  useEffect(() => {
    fetchReminders()
  }, [])

  const fetchReminders = async () => {
    try {
      const response = await fetch('/api/reminders')
      const data = await response.json()
      setReminders(data)
    } catch (error) {
      console.error('Error fetching reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customerId: formData.customerId || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      })

      if (response.ok) {
        setIsModalOpen(false)
        setFormData({
          title: '',
          description: '',
          type: 'GENERAL',
          dueDate: '',
          customerId: '',
        })
        fetchReminders()
      }
    } catch (error) {
      console.error('Error creating reminder:', error)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING',
        }),
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Error updating reminder:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return

    try {
      const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Error deleting reminder:', error)
    }
  }

  const pendingReminders = reminders.filter((r) => r.status === 'PENDING')
  const completedReminders = reminders.filter((r) => r.status === 'COMPLETED')

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Reminders</h1>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Reminder
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-yellow-600" />
                Pending ({pendingReminders.length})
              </h2>
              <div className="space-y-3">
                {pendingReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{reminder.title}</p>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {reminder.description}
                          </p>
                        )}
                        {reminder.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {formatDate(reminder.dueDate)}
                          </p>
                        )}
                        {reminder.customer && (
                          <p className="text-xs text-blue-600 mt-1">
                            Customer: {reminder.customer.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleToggleStatus(reminder.id, reminder.status)
                          }
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(reminder.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingReminders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No pending reminders
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Completed ({completedReminders.length})
              </h2>
              <div className="space-y-3">
                {completedReminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="p-4 border border-gray-200 rounded-lg opacity-60"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium line-through">{reminder.title}</p>
                        {reminder.description && (
                          <p className="text-sm text-gray-600 mt-1 line-through">
                            {reminder.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          handleToggleStatus(reminder.id, reminder.status)
                        }
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
                {completedReminders.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    No completed reminders
                  </p>
                )}
              </div>
            </div>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setFormData({
                title: '',
                description: '',
                type: 'GENERAL',
                dueDate: '',
                customerId: '',
              })
            }}
            title="Add Reminder"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title *"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
              <Input
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'GENERAL' | 'CUSTOMER',
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="GENERAL">General</option>
                  <option value="CUSTOMER">Customer Specific</option>
                </select>
              </div>
              <Input
                label="Due Date"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </Modal>
        </div>
      </AppLayout>
    </ProtectedRoute>
  )
}

