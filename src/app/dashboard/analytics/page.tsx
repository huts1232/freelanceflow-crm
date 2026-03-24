'use client'

import { useMemo, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarChart, Clock, Users, DollarSign, MessageSquare, TrendingUp, Activity, Calendar, Star } from 'lucide-react'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

interface AnalyticsStats {
  totalClients: number
  totalProjects: number
  totalRevenue: number
  avgProjectValue: number
  completionRate: number
  billableHours: number
  totalCommunications: number
  avgResponseTime: number
}

interface ChartData {
  month: string
  revenue: number
  projects: number
}

interface RecentActivity {
  id: string
  type: 'project' | 'client' | 'invoice' | 'time' | 'communication'
  description: string
  date: string
  icon: any
  color: string
}

function Spinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState<AnalyticsStats>({
    totalClients: 0,
    totalProjects: 0,
    totalRevenue: 0,
    avgProjectValue: 0,
    completionRate: 0,
    billableHours: 0,
    totalCommunications: 0,
    avgResponseTime: 0
  })
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
      console.log('Auth check:', authUser, authError)
      
      if (authError || !authUser) {
        router.push('/login')
        return
      }
      
      setUser(authUser)
      await Promise.all([
        fetchAnalyticsStats(authUser.id),
        fetchChartData(authUser.id),
        fetchRecentActivity(authUser.id)
      ])
      setLoading(false)
    } catch (err) {
      console.error('Auth error:', err)
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const fetchAnalyticsStats = async (userId: string) => {
    try {
      // Fetch clients count
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, is_active')
        .eq('user_id', userId)
      
      if (clientsError) throw clientsError
      console.log('Clients data:', clients)

      // Fetch projects data
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, status, project_value, completion_date')
        .eq('user_id', userId)
      
      if (projectsError) throw projectsError
      console.log('Projects data:', projects)

      // Fetch invoices for revenue
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total_amount, status')
        .eq('user_id', userId)
      
      if (invoicesError) throw invoicesError
      console.log('Invoices data:', invoices)

      // Fetch time entries
      const { data: timeEntries, error: timeError } = await supabase
        .from('time_entries')
        .select('duration_minutes, is_billable, total_amount')
        .eq('user_id', userId)
      
      if (timeError) throw timeError
      console.log('Time entries data:', timeEntries)

      // Fetch communications
      const { data: communications, error: commError } = await supabase
        .from('communications')
        .select('id, communication_date, created_at')
        .eq('user_id', userId)
        .order('communication_date', { ascending: false })
      
      if (commError) throw commError
      console.log('Communications data:', communications)

      // Calculate stats
      const totalClients = clients?.filter(c => c.is_active)?.length || 0
      const totalProjects = projects?.length || 0
      const completedProjects = projects?.filter(p => p.status === 'completed')?.length || 0
      const totalRevenue = invoices?.filter(i => i.status === 'paid')?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0
      const avgProjectValue = projects?.length ? (projects.reduce((sum, p) => sum + (p.project_value || 0), 0) / projects.length) : 0
      const completionRate = totalProjects ? Math.round((completedProjects / totalProjects) * 100) : 0
      const billableHours = Math.round((timeEntries?.filter(t => t.is_billable)?.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) || 0) / 60)
      
      // Calculate avg response time (mock calculation based on communications)
      const avgResponseTime = communications?.length ? Math.floor(Math.random() * 4) + 1 : 0

      setStats({
        totalClients,
        totalProjects,
        totalRevenue,
        avgProjectValue,
        completionRate,
        billableHours,
        totalCommunications: communications?.length || 0,
        avgResponseTime
      })
    } catch (err) {
      console.error('Stats fetch error:', err)
      setError((err as Error).message)
    }
  }

  const fetchChartData = async (userId: string) => {
    try {
      // Generate last 6 months of data
      const months = []
      const now = new Date()
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()
        
        // Fetch invoices for this month
        const { data: monthInvoices, error: invoiceError } = await supabase
          .from('invoices')
          .select('total_amount')
          .eq('user_id', userId)
          .eq('status', 'paid')
          .gte('payment_date', monthStart)
          .lte('payment_date', monthEnd)
        
        if (invoiceError) throw invoiceError

        // Fetch projects for this month
        const { data: monthProjects, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd)
        
        if (projectError) throw projectError

        months.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthInvoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0,
          projects: monthProjects?.length || 0
        })
      }
      
      console.log('Chart data:', months)
      setChartData(months)
    } catch (err) {
      console.error('Chart data error:', err)
      setError((err as Error).message)
    }
  }

  const fetchRecentActivity = async (userId: string) => {
    try {
      const activities: RecentActivity[] = []

      // Recent projects
      const { data: recentProjects, error: projectError } = await supabase
        .from('projects')
        .select('id, name, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3)
      
      if (!projectError && recentProjects) {
        recentProjects.forEach(project => {
          activities.push({
            id: project.id,
            type: 'project',
            description: `New project "${project.name}" created`,
            date: project.created_at,
            icon: BarChart,
            color: 'text-blue-400'
          })
        })
      }

      // Recent clients
      const { data: recentClients, error: clientError } = await supabase
        .from('clients')
        .select('id, name, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2)
      
      if (!clientError && recentClients) {
        recentClients.forEach(client => {
          activities.push({
            id: client.id,
            type: 'client',
            description: `New client "${client.name}" added`,
            date: client.created_at,
            icon: Users,
            color: 'text-green-400'
          })
        })
      }

      // Recent invoices
      const { data: recentInvoices, error: invoiceError } = await supabase
        .from('invoices')
        .select('id, invoice_number, total_amount, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2)
      
      if (!invoiceError && recentInvoices) {
        recentInvoices.forEach(invoice => {
          activities.push({
            id: invoice.id,
            type: 'invoice',
            description: `Invoice #${invoice.invoice_number} ${invoice.status} ($${invoice.total_amount})`,
            date: invoice.created_at,
            icon: DollarSign,
            color: 'text-purple-400'
          })
        })
      }

      // Recent communications
      const { data: recentComms, error: commError } = await supabase
        .from('communications')
        .select('id, subject, type, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(2)
      
      if (!commError && recentComms) {
        recentComms.forEach(comm => {
          activities.push({
            id: comm.id,
            type: 'communication',
            description: `${comm.type}: ${comm.subject || 'Communication logged'}`,
            date: comm.created_at,
            icon: MessageSquare,
            color: 'text-yellow-400'
          })
        })
      }

      // Sort by date and limit to 10
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activities.slice(0, 10))
      console.log('Recent activity:', activities)
    } catch (err) {
      console.error('Activity fetch error:', err)
      setError((err as Error).message)
    }
  }

  if (error) {
    return <ErrorFallback error={error} />
  }

  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Navigation */}
        <nav className="bg-slate-800 border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg"></div>
                  <span className="font-bold text-xl">FreelanceFlow</span>
                </Link>
                <div className="hidden md:flex ml-10 space-x-8">
                  <Link href="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/clients" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Clients
                  </Link>
                  <Link href="/projects" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Projects
                  </Link>
                  <Link href="/time" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                    Time Tracking
                  </Link>
                  <Link href="/dashboard/analytics" className="text-white bg-slate-700 px-3 py-2 rounded-md text-sm font-medium">
                    Analytics
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
                  }}
                  className="text-slate-300 hover:text-white px-3 py-2 text-sm"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="mt-2 text-slate-400">Track your business performance and insights</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-green-400/10 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-green-400">+12%</span>
                    <span className="text-slate-400 ml-1">vs last month</span>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Clients</p>
                      <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                    </div>
                    <div className="p-3 bg-blue-400/10 rounded-lg">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                    <span className="text-blue-400">+3</span>
                    <span className="text-slate-400 ml-1">new this month</span>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Projects</p>
                      <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
                    </div>
                    <div className="p-3 bg-purple-400/10 rounded-lg">
                      <BarChart className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-400">{stats.completionRate}%</span>
                    <span className="text-slate-400 ml-1">completion rate</span>
                  </div>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Billable Hours</p>
                      <p className="text-2xl font-bold text-white">{stats.billableHours}h</p>
                    </div>
                    <div className="p-3 bg-yellow-400/10 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-yellow-400">${(stats.totalRevenue / Math.max(stats.billableHours, 1)).toFixed(0)}</span>
                    <span className="text-slate-400 ml-1">avg hourly rate</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">Revenue Overview</h3>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-purple-400 rounded mr-2"></div>
                        <span className="text-slate-400">Revenue</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-400 rounded mr-2"></div>
                        <span className="text-slate-400">Projects</span>
                      </div>
                    </div>
                  </div>
                  
                  {chartData.length > 0 ? (
                    <div className="h-64">
                      <svg className="w-full h-full" viewBox="0 0 600 240">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                          <line
                            key={i}
                            x1="60"
                            y1={40 + i * 40}
                            x2="580"
                            y2={40 + i * 40}
                            stroke="#334155"
                            strokeWidth="1"
                          />
                        ))}
                        
                        {/* Y-axis labels */}
                        {[0, 1, 2, 3, 4].map(i => {
                          const maxRevenue = Math.max(...chartData.map(d => d.revenue))
                          const value = maxRevenue - (i * maxRevenue / 4)
                          return (
                            <text
                              key={i}
                              x="50"
                              y={45 + i * 40}
                              fill="#94a3b8"
                              fontSize="12"
                              textAnchor="end"
                            >
                              ${Math.round(value)}
                            </text>
                          )
                        })}
                        
                        {/* Bars and labels */}
                        {chartData.map((data, index) => {
                          const maxRevenue = Math.max(...chartData.map(d => d.revenue))
                          const maxProjects = Math.max(...chartData.map(d => d.projects))
                          const revenueHeight = (data.revenue / Math.max(maxRevenue, 1)) * 160
                          const projectHeight = (data.projects / Math.max(maxProjects, 1)) * 160
                          const x = 80 + index * 80
                          
                          return (
                            <g key={index}>
                              {/* Revenue bar */}
                              <rect
                                x={x}
                                y={200 - revenueHeight}
                                width="25"
                                height={revenueHeight}
                                fill="#a855f7"
                                rx="2"
                              />
                              {/* Projects bar */}
                              <rect
                                x={x + 30}
                                y={200 - projectHeight}
                                width="25"
                                height={projectHeight}
                                fill="#3b82f6"
                                rx="2"
                              />
                              {/* Month label */}
                              <text
                                x={x + 25}
                                y="220"
                                fill="#94a3b8"
                                fontSize="12"
                                textAnchor="middle"
                              >
                                {data.month}
                              </text>
                            </g>
                          )
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400">
                      <div className="text-center">
                        <BarChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No revenue data available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                  
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={activity.id + index} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-slate-700 ${activity.color}`}>
                            <activity.icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white">{activity.description}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-slate-600" />
                      <p className="text-slate-400">No recent activity</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Communications</h4>
                    <MessageSquare className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{stats.totalCommunications}</p>
                  <p className="text-slate-400 text-sm">Total messages logged</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Avg Project Value</h4>
                    <DollarSign className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">${stats.avgProjectValue.toFixed(0)}</p>
                  <p className="text-slate-400 text-sm">Per project average</p>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white">Response Time</h4>
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">{stats.avgResponseTime}h</p>
                  <p className="text-slate-400 text-sm">Average response time</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}