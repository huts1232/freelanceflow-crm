'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, DollarSign, Activity, TrendingUp, Eye, Trash2, Shield } from 'lucide-react'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
    </div>
  )
}

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
}

interface UserData {
  id: string
  user_id: string
  created_at: string
}

interface Stats {
  totalUsers: number
  totalRevenue: number
  activeProjects: number
  totalInvoices: number
}

export default function AdminPage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalRevenue: 0, activeProjects: 0, totalInvoices: 0 })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [deleting, setDeleting] = useState<string>('')

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('Auth check:', user, authError)
      
      if (authError) {
        console.error('Auth error:', authError)
        setError(authError.message)
        return
      }

      if (!user) {
        router.push('/login')
        return
      }

      // Check if user is admin (you might want to add an admin role check here)
      await fetchData()
    } catch (err) {
      console.error('Auth check error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users_data')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Users response:', usersData, usersError)
      
      if (usersError) {
        console.error('Users error:', usersError)
        setError(usersError.message)
        return
      }

      setUsers(usersData || [])

      // Fetch stats
      const [
        { count: totalUsers },
        { data: invoicesData },
        { count: activeProjects },
        { count: totalInvoices }
      ] = await Promise.all([
        supabase.from('users_data').select('*', { count: 'exact', head: true }),
        supabase.from('invoices').select('total_amount'),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('invoices').select('*', { count: 'exact', head: true })
      ])

      const totalRevenue = invoicesData?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0

      setStats({
        totalUsers: totalUsers || 0,
        totalRevenue,
        activeProjects: activeProjects || 0,
        totalInvoices: totalInvoices || 0
      })

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('communications')
        .select(`
          *,
          clients(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      console.log('Activity response:', activityData, activityError)
      
      if (activityError) {
        console.error('Activity error:', activityError)
      } else {
        setRecentActivity(activityData || [])
      }

    } catch (err) {
      console.error('Fetch data error:', err)
      setError((err as Error).message)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeleting(userId)
    try {
      const { error } = await supabase
        .from('users_data')
        .delete()
        .eq('id', userId)

      console.log('Delete response:', error)

      if (error) {
        console.error('Delete error:', error)
        alert('Error deleting user: ' + error.message)
        return
      }

      await fetchData()
    } catch (err) {
      console.error('Delete user error:', err)
      alert('Error deleting user: ' + (err as Error).message)
    } finally {
      setDeleting('')
    }
  }

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorFallback error={error} />

  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-slate-400 mt-2">
                Manage users and monitor system activity
              </p>
            </div>
            <Link 
              href="/dashboard"
              className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalUsers}</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Total Users</h3>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-white">
                  ${stats.totalRevenue.toLocaleString()}
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Total Revenue</h3>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.activeProjects}</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Active Projects</h3>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                </div>
                <span className="text-2xl font-bold text-white">{stats.totalInvoices}</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium">Total Invoices</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Users Management
                </h2>
              </div>

              {users.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">User ID</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Created</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                          <td className="py-3 px-4">
                            <div className="text-white font-medium truncate max-w-[150px]">
                              {user.user_id}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-400 text-sm">
                              {new Date(user.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => deleteUser(user.id)}
                                disabled={deleting === user.id}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                                title="Delete user"
                              >
                                {deleting === user.id ? (
                                  <div className="w-4 h-4 animate-spin border border-red-400 border-t-transparent rounded-full" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </h2>
              </div>

              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium truncate">
                            {activity.subject || 'Communication'}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.type === 'email' ? 'bg-blue-500/20 text-blue-400' :
                            activity.type === 'call' ? 'bg-green-500/20 text-green-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm truncate">
                          {activity.clients?.name || 'Unknown Client'}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}