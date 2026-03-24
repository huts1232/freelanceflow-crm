'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  FolderOpen, 
  Clock, 
  DollarSign, 
  Plus, 
  Settings, 
  Home,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react'

function ErrorFallback({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md">
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p className="text-sm">{error}</p>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  )
}

interface Client {
  id: string
  name: string
  email: string
  company: string
  created_at: string
}

interface Project {
  id: string
  name: string
  status: string
  client_id: string
  project_value: number
  progress_percentage: number
  clients: { name: string }
}

interface TimeEntry {
  id: string
  task_name: string
  duration_minutes: number
  total_amount: number
  is_billable: boolean
  created_at: string
  clients: { name: string }
  projects: { name: string }
}

interface DashboardStats {
  totalClients: number
  activeProjects: number
  monthlyRevenue: number
  totalHours: number
}

export default function Dashboard() {
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats>({ totalClients: 0, activeProjects: 0, monthlyRevenue: 0, totalHours: 0 })
  const [recentClients, setRecentClients] = useState<Client[]>([])
  const [activeProjects, setActiveProjects] = useState<Project[]>([])
  const [recentTimeEntries, setRecentTimeEntries] = useState<TimeEntry[]>([])
  const [showClientModal, setShowClientModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', email: '', company: '', phone: '' })
  const [newProject, setNewProject] = useState({ name: '', description: '', client_id: '', project_value: 0 })
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()
  
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Auth check:', user, error)
      
      if (error || !user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      await Promise.all([
        fetchStats(user.id),
        fetchRecentClients(user.id),
        fetchActiveProjects(user.id),
        fetchRecentTimeEntries(user.id)
      ])
      setLoading(false)
    } catch (err) {
      console.error('Auth error:', err)
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const fetchStats = async (userId: string) => {
    try {
      const [clientsRes, projectsRes, revenueRes, hoursRes] = await Promise.all([
        supabase.from('clients').select('id').eq('user_id', userId).eq('is_active', true),
        supabase.from('projects').select('id').eq('user_id', userId).in('status', ['in_progress', 'planning']),
        supabase.from('invoices').select('total_amount').eq('user_id', userId).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from('time_entries').select('duration_minutes').eq('user_id', userId).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
      ])

      console.log('Stats responses:', { clientsRes, projectsRes, revenueRes, hoursRes })

      const totalClients = clientsRes.data?.length || 0
      const activeProjects = projectsRes.data?.length || 0
      const monthlyRevenue = revenueRes.data?.reduce((sum, invoice) => sum + (invoice.total_amount || 0), 0) || 0
      const totalHours = Math.round((hoursRes.data?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0) / 60)

      setStats({ totalClients, activeProjects, monthlyRevenue, totalHours })
    } catch (err) {
      console.error('Stats error:', err)
    }
  }

  const fetchRecentClients = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, company, created_at')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('Recent clients response:', data, error)
      
      if (error) throw error
      setRecentClients(data || [])
    } catch (err) {
      console.error('Recent clients error:', err)
    }
  }

  const fetchActiveProjects = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id, name, status, client_id, project_value, progress_percentage,
          clients!inner(name)
        `)
        .eq('user_id', userId)
        .in('status', ['in_progress', 'planning'])
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('Active projects response:', data, error)
      
      if (error) throw error
      setActiveProjects(data || [])
    } catch (err) {
      console.error('Active projects error:', err)
    }
  }

  const fetchRecentTimeEntries = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          id, task_name, duration_minutes, total_amount, is_billable, created_at,
          clients!inner(name),
          projects!inner(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('Recent time entries response:', data, error)
      
      if (error) throw error
      setRecentTimeEntries(data || [])
    } catch (err) {
      console.error('Recent time entries error:', err)
    }
  }

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user.id,
          name: newClient.name,
          email: newClient.email,
          company: newClient.company,
          phone: newClient.phone,
          is_active: true
        })
        .select()

      console.log('Create client response:', data, error)
      
      if (error) {
        alert(`Error creating client: ${error.message}`)
        return
      }
      
      setShowClientModal(false)
      setNewClient({ name: '', email: '', company: '', phone: '' })
      await Promise.all([
        fetchStats(user.id),
        fetchRecentClients(user.id)
      ])
    } catch (err) {
      console.error('Create client error:', err)
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          client_id: newProject.client_id,
          name: newProject.name,
          description: newProject.description,
          status: 'planning',
          priority: 'medium',
          project_value: newProject.project_value,
          progress_percentage: 0
        })
        .select()

      console.log('Create project response:', data, error)
      
      if (error) {
        alert(`Error creating project: ${error.message}`)
        return
      }
      
      setShowProjectModal(false)
      setNewProject({ name: '', description: '', client_id: '', project_value: 0 })
      await Promise.all([
        fetchStats(user.id),
        fetchActiveProjects(user.id)
      ])
    } catch (err) {
      console.error('Create project error:', err)
      alert(`Error: ${(err as Error).message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }

  if (error) {
    return <ErrorFallback error={error} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  try {
    return (
      <div className="min-h-screen bg-slate-900 flex">
        {/* Sidebar */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          <div className="p-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">FreelanceFlow</h1>
            <p className="text-sm text-slate-400">CRM Dashboard</p>
          </div>
          
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              <Link href="/dashboard" className="flex items-center space-x-3 px-4 py-2 text-purple-400 bg-purple-400/10 rounded-lg">
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link href="/clients" className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Users className="w-5 h-5" />
                <span>Clients</span>
              </Link>
              <Link href="/projects" className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <FolderOpen className="w-5 h-5" />
                <span>Projects</span>
              </Link>
              <Link href="/time" className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <Clock className="w-5 h-5" />
                <span>Time Tracking</span>
              </Link>
              <button className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors w-full text-left">
                <FileText className="w-5 h-5" />
                <span>Invoices</span>
              </button>
              <button className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors w-full text-left">
                <MessageSquare className="w-5 h-5" />
                <span>Communications</span>
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={signOut}
              className="flex items-center space-x-3 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors w-full text-left"
            >
              <Settings className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-slate-800 border-b border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Welcome back!</h1>
                <p className="text-slate-400">Here's what's happening with your freelance business</p>
              </div>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowClientModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Client</span>
                </button>
                <button 
                  onClick={() => setShowProjectModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Project</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Clients</p>
                    <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Projects</p>
                    <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
                  </div>
                  <FolderOpen className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">${stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Hours This Month</p>
                    <p className="text-2xl font-bold text-white">{stats.totalHours}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Recent Clients */}
              <div className="bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Clients</h3>
                    <Link href="/clients" className="text-purple-400 hover:text-purple-300 text-sm">
                      View all
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {recentClients.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No clients yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentClients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{client.name}</p>
                            <p className="text-slate-400 text-sm">{client.company}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-sm">
                              {new Date(client.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Projects */}
              <div className="bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Active Projects</h3>
                    <Link href="/projects" className="text-purple-400 hover:text-purple-300 text-sm">
                      View all
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {activeProjects.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No active projects</p>
                  ) : (
                    <div className="space-y-4">
                      {activeProjects.map((project) => (
                        <div key={project.id} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium">{project.name}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              project.status === 'in_progress' 
                                ? 'bg-blue-400/10 text-blue-400' 
                                : 'bg-yellow-400/10 text-yellow-400'
                            }`}>
                              {project.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm">{project.clients.name}</p>
                          <div className="flex items-center justify-between">
                            <div className="w-full bg-slate-700 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${project.progress_percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-slate-400 text-sm ml-2">
                              {project.progress_percentage}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Time Entries */}
              <div className="bg-slate-800 rounded-xl border border-slate-700">
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Recent Time Entries</h3>
                    <Link href="/time" className="text-purple-400 hover:text-purple-300 text-sm">
                      View all
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {recentTimeEntries.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No time entries yet</p>
                  ) : (
                    <div className="space-y-4">
                      {recentTimeEntries.map((entry) => (
                        <div key={entry.id} className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">{entry.task_name}</p>
                            <p className="text-slate-400 text-sm">{entry.projects.name}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {Math.round(entry.duration_minutes / 60 * 100) / 100}h
                            </p>
                            <p className={`text-sm ${entry.is_billable ? 'text-green-400' : 'text-slate-400'}`}>
                              ${entry.total_amount?.toFixed(2) || '0.00'}
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
        </div>

        {/* New Client Modal */}
        {showClientModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">New Client</h3>
                <button 
                  onClick={() => setShowClientModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={createClient} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="client@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Company</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Phone number"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    {submitting ? <LoadingSpinner /> : <Plus className="w-4 h-4" />}
                    <span>Create Client</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* New Project Modal */}
        {showProjectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
              <div className="flex items-center justify-between p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">New Project</h3>
                <button 
                  onClick={() => setShowProjectModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={createProject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Client *</label>
                  <select
                    required
                    value={newProject.client_id}
                    onChange={(e) => setNewProject({ ...newProject, client_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select a client</option>
                    {recentClients.map((client) => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Project description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Project Value</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProject.project_value}
                    onChange={(e) => setNewProject({ ...newProject, project_value: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2