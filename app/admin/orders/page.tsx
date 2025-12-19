"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getOrders, updateOrderStatusWithStockManagement, deleteOrder } from "@/lib/firebase-utils"
import { Order, OrderItem } from "@/types/schema"
import { Separator } from "@/components/ui/separator"
import { Package, Truck, Loader2, Clock, XCircle, AlertTriangle, Trash2 } from "lucide-react"
import React from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [stockError, setStockError] = useState<{
    orderId: string;
    items: Array<{ title: string; requested: number; available: number }>;
  } | null>(null)

  // Get allowed status transitions for an order
  const getAllowedStatuses = (currentStatus: Order["status"]): Order["status"][] => {
    switch (currentStatus) {
      case 'pending':
        return ['pending', 'processing', 'cancelled']
      case 'processing':
        return ['processing', 'shipped', 'cancelled']
      case 'shipped':
        return ['shipped', 'delivered']
      case 'delivered':
        return ['delivered'] // Final state, cannot change
      case 'cancelled':
        return ['cancelled'] // Final state, cannot change
      default:
        return [currentStatus]
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const data = await getOrders()
      setOrders(data)
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: Order["status"], currentStatus: Order["status"]) => {
    try {
      setUpdatingOrderId(orderId)
      setStockError(null)
      
      const result = await updateOrderStatusWithStockManagement(orderId, newStatus, currentStatus)
      
      if (!result.success) {
        if (result.stockIssues && result.stockIssues.length > 0) {
          setStockError({
            orderId,
            items: result.stockIssues,
          })
        } else {
          alert(result.error || "Failed to update order status")
        }
      } else {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      }
    } catch (err) {
      console.error("Failed to update status", err)
      alert("Failed to update status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    
    try {
      setDeletingOrderId(orderToDelete)
      await deleteOrder(orderToDelete)
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete))
      setOrderToDelete(null)
    } catch (err) {
      console.error("Failed to delete order", err)
      alert("Failed to delete order")
    } finally {
      setDeletingOrderId(null)
    }
  }

  const getStatusStyle = (status: Order["status"]) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-gray-200 text-gray-700",
    }
    return styles[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: Order["status"]) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="h-4 w-4 mr-1" />,
      processing: <Loader2 className="h-4 w-4 mr-1 animate-spin text-purple-700" />,
      shipped: <Truck className="h-4 w-4 mr-1" />,
      delivered: <Package className="h-4 w-4 mr-1" />,
      cancelled: <XCircle className="h-4 w-4 mr-1 text-gray-500" />,
    }
    return icons[status]
  }

  return (
    <div className="space-y-10 p-8 max-w-7xl mx-auto ml-8 mt-8">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 p-10 text-white shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">📦 Orders Management</h1>
        <p className="text-indigo-100 text-sm">Monitor, update, and manage all customer orders in one place.</p>
      </div>

      {/* Stock Error Alert */}
      {stockError && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Insufficient Stock - Cannot Process Order</AlertTitle>
          <AlertDescription>
            <p className="mb-2 font-semibold">Please add inventory for the following items before processing this order:</p>
            <ul className="list-disc list-inside space-y-2">
              {stockError.items.map((item, idx) => (
                <li key={idx} className="text-sm">
                  <strong>{item.title}</strong>
                  <div className="ml-5 mt-1">
                    <span className="text-red-700">Requested: {item.requested}</span>
                    <span className="mx-2">•</span>
                    <span className={item.available === 0 ? "text-red-800 font-bold" : "text-red-700"}>
                      Available: {item.available}
                      {item.available === 0 && " (OUT OF STOCK)"}
                    </span>
                    <span className="mx-2">•</span>
                    <span className="text-red-600">Need to add: {item.requested - item.available}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                💡 <strong>Action Required:</strong> Go to Products page and update inventory for these items, then try processing the order again.
              </p>
            </div>
            <button
              onClick={() => setStockError(null)}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
            >
              Dismiss
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Orders Section */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
          <p className="text-gray-500">New orders will appear here once customers start purchasing.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 hover:shadow-lg transition-all border border-gray-200 bg-white rounded-2xl"
            >
              {/* Header Info */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.customerName}</h3>
                  <p className="text-sm text-gray-500">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">
                    {order.createdAt?.toDate?.()?.toLocaleDateString?.() ?? ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusStyle(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <button
                    onClick={() => setOrderToDelete(order.id)}
                    disabled={deletingOrderId === order.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete order"
                  >
                    {deletingOrderId === order.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Customer Info */}
              <div className="space-y-1 mb-3">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Phone:</span> {order.customerPhone}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Address:</span>{" "}
                  {typeof order.shippingAddress === 'string' 
                    ? `${order.shippingAddress}, ${order.city}` 
                    : `${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || order.city || ''}`}
                </p>
              </div>

              <Separator className="my-3" />

              {/* Order Items */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-gray-800 mb-1">Order Items</p>
                {order.items?.map((item: OrderItem, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center rounded-lg border px-3 py-2 bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × Rs. {item.price.toFixed(0)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-indigo-600">
                      Rs. {(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Subtotal</p>
                  <p className="text-sm font-medium text-gray-800">
                    Rs. {((order.subtotal ?? order.totalAmount ?? 0) - (order.deliveryFee ?? 0)).toFixed(0)}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Delivery Fee</p>
                  <p className="text-sm font-medium text-gray-800">
                    Rs. {(order.deliveryFee ?? 0).toFixed(0)}
                  </p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <p className="text-base font-semibold text-gray-900">Total Amount</p>
                  <p className="text-xl font-bold text-indigo-700">Rs. {(order.totalAmount ?? 0).toFixed(0)}</p>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Status Dropdown */}
              <div className="flex justify-end items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value as Order["status"], order.status)}
                  disabled={updatingOrderId === order.id || order.status === 'delivered' || order.status === 'cancelled'}
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getAllowedStatuses(order.status).map(status => {
                    const statusLabels: Record<string, string> = {
                      pending: '🕒 Pending',
                      processing: '⚙️ Processing',
                      shipped: '🚚 Shipped',
                      delivered: '📦 Delivered',
                      cancelled: '⛔ Cancelled'
                    }
                    return (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    )
                  })}
                </select>
                {updatingOrderId === order.id && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this order from the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
