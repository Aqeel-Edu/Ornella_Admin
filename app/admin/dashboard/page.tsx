"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getProducts, getCategories, getBlogs, getOrders } from "@/lib/firebase-utils"
import { Order } from "@/types/schema"
import { Package, Tag, Star, BookOpen, ShoppingCart, TrendingUp, Calendar, DollarSign, ArrowUpRight, BarChart3 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

interface OrderByProduct {
  productTitle: string
  quantity: number
  revenue: number
}

interface ChartData {
  date: string
  fullDate: string
  orders: number
  sales: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    featuredProducts: 0,
    totalBlogs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dateRangeStart, setDateRangeStart] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [dateRangeEnd, setDateRangeEnd] = useState(new Date().toISOString().split('T')[0])
  const [orders, setOrders] = useState<Order[]>([])
  const [todayOrders, setTodayOrders] = useState<Order[]>([])
  const [todaySales, setTodaySales] = useState(0)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, categories, blogs, ordersData] = await Promise.all([
          getProducts(),
          getCategories(),
          getBlogs(),
          getOrders(),
        ])

        setStats({
          totalProducts: products.length,
          totalCategories: categories.length,
          featuredProducts: products.filter((p: any) => p.featured).length,
          totalBlogs: blogs.length,
        })
        
        setOrders(ordersData)
        calculateTodayStats(ordersData)
        calculateDateRange(ordersData, dateRangeStart, dateRangeEnd)
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const calculateTodayStats = (allOrders: Order[]) => {
    const today = new Date().toISOString().split('T')[0]
    
    const todayFiltered = allOrders.filter(order => {
      const orderDate = order.createdAt?.toDate?.()?.toISOString().split('T')[0]
      return orderDate === today
    })

    setTodayOrders(todayFiltered)
    
    // Only count revenue from confirmed orders (processing, shipped, delivered)
    const confirmedOrders = todayFiltered.filter(order => 
      order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
    )
    const todayTotal = confirmedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
    setTodaySales(todayTotal)
  }

  const calculateDateRange = (allOrders: Order[], startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const data: ChartData[] = []
    
    let currentDate = new Date(start)
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      const dayOrders = allOrders.filter(order => {
        const orderDate = order.createdAt?.toDate?.()?.toISOString().split('T')[0]
        return orderDate === dateStr
      })
      
      const daySales = dayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      
      data.push({
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateStr,
        orders: dayOrders.length,
        sales: daySales
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    setChartData(data)
  }

  const handleDateRangeChange = () => {
    calculateDateRange(orders, dateRangeStart, dateRangeEnd)
  }

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Categories",
      value: stats.totalCategories,
      icon: Tag,
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Blog Posts",
      value: stats.totalBlogs,
      icon: BookOpen,
      gradient: "from-indigo-500 to-purple-500",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Featured Products",
      value: stats.featuredProducts,
      icon: Star,
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ]

  const maxSales = Math.max(...chartData.map(d => d.sales), 1)
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1)

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-5xl font-black mb-2 tracking-tight">Analytics Dashboard</h1>
              <p className="text-purple-100 text-lg font-medium">Real-time insights into your business performance</p>
            </div>
          </div>
        </div>
        <div className="absolute top-10 right-10 text-white/30 text-9xl font-black">📊</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.title} 
              className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              <div className="relative p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-14 h-14 ${stat.iconBg} ${stat.iconColor} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className={`bg-gradient-to-r ${stat.gradient} text-transparent bg-clip-text`}>
                    <ArrowUpRight className="w-5 h-5" style={{ stroke: 'url(#gradient)' }} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{stat.title}</p>
                <p className="text-4xl font-black bg-gradient-to-r text-gray-900">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Today's Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl" />
          <div className="relative p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Orders</p>
                <p className="text-4xl font-black text-gray-900">{todayOrders.length}</p>
              </div>
            </div>
            <Separator className="my-4 bg-emerald-200" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
                <p className="text-xs text-gray-600 font-medium">Pending</p>
                <p className="text-lg font-bold text-yellow-600">{todayOrders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
                <p className="text-xs text-gray-600 font-medium">Processing</p>
                <p className="text-lg font-bold text-blue-600">{todayOrders.filter(o => o.status === 'processing').length}</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-2">
                <p className="text-xs text-gray-600 font-medium">Delivered</p>
                <p className="text-lg font-bold text-green-600">{todayOrders.filter(o => o.status === 'delivered').length}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl" />
          <div className="relative p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Today's Revenue</p>
                <p className="text-4xl font-black text-gray-900">₨ {todaySales.toLocaleString()}</p>
              </div>
            </div>
            <Separator className="my-4 bg-blue-200" />
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3">
              <p className="text-xs text-gray-600 font-medium mb-1">Average Order Value</p>
              <p className="text-2xl font-bold text-indigo-600">
                ₨ {todayOrders.length > 0 ? (todaySales / todayOrders.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Date Range Selector & Charts */}
      <Card className="border-none shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-7 h-7" />
            <h2 className="text-3xl font-black">Date Range Analytics</h2>
          </div>
          <p className="text-violet-100">Analyze orders and sales across custom time periods</p>
        </div>

        <div className="p-8">
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div>
              <Label htmlFor="start-date" className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                Start Date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={dateRangeStart}
                onChange={(e) => setDateRangeStart(e.target.value)}
                className="border-2 border-gray-300 focus:border-violet-500 rounded-xl font-medium"
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="text-sm font-bold text-gray-700 mb-2 block uppercase tracking-wide">
                End Date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={dateRangeEnd}
                onChange={(e) => setDateRangeEnd(e.target.value)}
                className="border-2 border-gray-300 focus:border-violet-500 rounded-xl font-medium"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleDateRangeChange}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Update Charts
              </Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Orders Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Orders Timeline</h3>
              </div>
              <div className="space-y-2">
                {chartData.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No data for selected range</p>
                ) : (
                  chartData.map((day, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-700">{day.date}</span>
                        <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1 rounded-full">
                          {day.orders} orders
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-full h-8 overflow-hidden shadow-inner">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:from-green-600 group-hover:to-emerald-600"
                          style={{ width: `${Math.max((day.orders / maxOrders) * 100, 3)}%` }}
                        >
                          {day.orders > 0 && (
                            <span className="text-xs font-bold text-white drop-shadow">
                              {((day.orders / maxOrders) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sales Bar Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-900">Revenue Timeline</h3>
              </div>
              <div className="space-y-2">
                {chartData.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No data for selected range</p>
                ) : (
                  chartData.map((day, idx) => (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-gray-700">{day.date}</span>
                        <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                          ₨ {day.sales.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative w-full bg-gray-100 rounded-full h-8 overflow-hidden shadow-inner">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700 ease-out flex items-center justify-end pr-3 group-hover:from-blue-600 group-hover:to-indigo-600"
                          style={{ width: `${Math.max((day.sales / maxSales) * 100, 3)}%` }}
                        >
                          {day.sales > 0 && (
                            <span className="text-xs font-bold text-white drop-shadow">
                              {((day.sales / maxSales) * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
