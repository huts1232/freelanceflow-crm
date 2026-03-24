'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { User, Settings, Trash2, Crown, Mail, Calendar, AlertTriangle } from 'lucide-react'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  )
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  const router = useRouter()
  
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Auth check response:', { user, error })
      
      if (error) {
        console.error('Auth error:', error)
        router.push('/login')
        return
      }
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
    } catch (err) {
      console.error('Auth check error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (deleteConfirm !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion')
      return
    }
    
    setIsDeleting(true)
    setError('')
    
    try {
      // Delete user data in order (reverse foreign key dependencies)
      const deleteQueries = [
        'invoice_line_items',
        'invoices', 
        'time_entries',
        'communications',
        'projects',
        'clients',
        'chatbots',
        'pipeline_stages',
        'users_data'
      ]
      
      for (const table of deleteQueries) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error)
          throw error
        }
      }
      
      // Sign out and redirect
      await supabase.auth.signOut()
      router.push('/')
      
    } catch (err) {
      console.error('Delete account error:', err)
      setError((err as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (err) {
      console.error('Sign out error:', err)
      setError((err as Error).message)
    }
  }

  if (error) {
    return <ErrorFallback error={error} />
  }

  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Settings
              </h1>
            </div>
            <p className="text-slate-400">Manage your account and preferences</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Profile Section */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-500/20">
                    <User className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Profile Information</h2>
                    <p className="text-slate-400">Your account details</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Email</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{user?.email}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">User ID</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-mono text-sm">{user?.id}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Member Since</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-white">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-300">Last Sign In</label>
                    <div className="flex items-center gap-2 p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-white">
                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Information */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/20">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Plan Information</h2>
                    <p className="text-slate-400">Your current subscription</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">FreelanceFlow Pro</h3>
                      <p className="text-slate-400">Full access to all features</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">$19</div>
                      <div className="text-sm text-slate-400">per month</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-600/50">
                    <div className="flex items-center gap-2 text-sm text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Active subscription
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Account Actions</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={handleSignOut}
                    className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-500/5 backdrop-blur border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Danger Zone</h2>
                    <p className="text-slate-400">Irreversible actions</p>
                  </div>
                </div>
                
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <h3 className="font-semibold text-red-400 mb-2">Delete Account</h3>
                  <p className="text-sm text-slate-300 mb-4">
                    This will permanently delete your account and all associated data including clients, projects, time entries, and invoices. This action cannot be undone.
                  </p>
                  
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Delete Account</h3>
              </div>
              
              <p className="text-slate-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all data from our servers.
              </p>
              
              <form onSubmit={handleDeleteAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Type <span className="text-red-400 font-bold">DELETE</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
                    placeholder="DELETE"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false)
                      setDeleteConfirm('')
                      setError('')
                    }}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting || deleteConfirm !== 'DELETE'}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <LoadingSpinner /> : <Trash2 className="w-4 h-4" />}
                    {isDeleting ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}