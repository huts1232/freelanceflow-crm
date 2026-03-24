'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, Settings, Bell, Shield, Trash2, Save, Loader2 } from 'lucide-react'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

interface UserProfile {
  id: string
  email: string
  name: string | null
}

interface UserSettings {
  email_notifications: boolean
  push_notifications: boolean
  marketing_emails: boolean
  project_updates: boolean
  invoice_reminders: boolean
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    marketing_emails: false,
    project_updates: true,
    invoice_reminders: true
  })
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Auth error:', userError)
        setError(userError.message)
        return
      }

      if (!user) {
        setError('Not authenticated')
        return
      }

      setUser({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null
      })
      setEmail(user.email || '')
      setName(user.user_metadata?.name || '')

      // Load user settings from users_data table
      const { data: userData, error: dataError } = await supabase
        .from('users_data')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (dataError && dataError.code !== 'PGRST116') {
        console.error('Settings error:', dataError)
      } else if (userData) {
        // If user has specific settings, use them
        setSettings(prev => ({
          ...prev,
          ...(userData.settings || {})
        }))
      }

    } catch (err) {
      console.error('Load user error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      // Update auth profile
      const { error: updateError } = await supabase.auth.updateUser({
        data: { name }
      })
      
      if (updateError) {
        console.error('Update profile error:', updateError)
        setError(updateError.message)
        return
      }

      // Update users_data table
      const { data, error: upsertError } = await supabase
        .from('users_data')
        .upsert({
          user_id: user?.id,
          settings: settings
        }, {
          onConflict: 'user_id'
        })

      console.log('Supabase response:', data, upsertError)
      
      if (upsertError) {
        console.error('Save settings error:', upsertError)
        setError(upsertError.message)
        return
      }

      alert('Profile updated successfully!')
      
    } catch (err) {
      console.error('Save profile error:', err)
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      const { data, error: upsertError } = await supabase
        .from('users_data')
        .upsert({
          user_id: user?.id,
          settings: settings
        }, {
          onConflict: 'user_id'
        })

      console.log('Supabase response:', data, upsertError)
      
      if (upsertError) {
        console.error('Save notifications error:', upsertError)
        setError(upsertError.message)
        return
      }

      alert('Notification preferences saved!')
      
    } catch (err) {
      console.error('Save notifications error:', err)
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion')
      return
    }

    try {
      setDeleting(true)
      
      // Delete all user data first
      const userId = user?.id
      if (!userId) return

      // Delete in order to respect foreign key constraints
      await supabase.from('invoice_line_items').delete().eq('user_id', userId)
      await supabase.from('invoices').delete().eq('user_id', userId)
      await supabase.from('time_entries').delete().eq('user_id', userId)
      await supabase.from('communications').delete().eq('user_id', userId)
      await supabase.from('projects').delete().eq('user_id', userId)
      await supabase.from('clients').delete().eq('user_id', userId)
      await supabase.from('chatbots').delete().eq('user_id', userId)
      await supabase.from('pipeline_stages').delete().eq('user_id', userId)
      await supabase.from('users_data').delete().eq('user_id', userId)

      // Sign out user
      await supabase.auth.signOut()
      
      alert('Account deleted successfully')
      window.location.href = '/'
      
    } catch (err) {
      console.error('Delete account error:', err)
      setError((err as Error).message)
    } finally {
      setDeleting(false)
    }
  }

  const updateNotificationSetting = (key: keyof UserSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (error) {
    return <ErrorFallback error={error} />
  }

  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
            <p className="text-slate-400">Manage your account preferences and settings</p>
          </div>

          {loading ? (
            <div className="bg-slate-800 rounded-xl p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
              <p className="text-slate-400">Loading settings...</p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              {/* Tabs */}
              <div className="border-b border-slate-700">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'profile'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-300'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-2" />
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'notifications'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-300'
                    }`}
                  >
                    <Bell className="h-4 w-4 inline mr-2" />
                    Notifications
                  </button>
                  <button
                    onClick={() => setActiveTab('security')}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === 'security'
                        ? 'border-purple-500 text-purple-400'
                        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-300'
                    }`}
                  >
                    <Shield className="h-4 w-4 inline mr-2" />
                    Danger Zone
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <form onSubmit={handleSaveProfile}>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          disabled
                          className="w-full bg-slate-600 border border-slate-600 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed"
                        />
                        <p className="text-xs text-slate-400 mt-1">
                          Email cannot be changed here. Contact support if needed.
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <form onSubmit={handleSaveNotifications}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-4">Email Notifications</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-slate-300">
                                Email Notifications
                              </label>
                              <p className="text-xs text-slate-400">
                                Receive email notifications for account activity
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.email_notifications}
                                onChange={(e) => updateNotificationSetting('email_notifications', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-slate-300">
                                Project Updates
                              </label>
                              <p className="text-xs text-slate-400">
                                Get notified when projects are updated
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.project_updates}
                                onChange={(e) => updateNotificationSetting('project_updates', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-slate-300">
                                Invoice Reminders
                              </label>
                              <p className="text-xs text-slate-400">
                                Receive reminders about upcoming invoice due dates
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.invoice_reminders}
                                onChange={(e) => updateNotificationSetting('invoice_reminders', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <label className="text-sm font-medium text-slate-300">
                                Marketing Emails
                              </label>
                              <p className="text-xs text-slate-400">
                                Receive updates about new features and tips
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settings.marketing_emails}
                                onChange={(e) => updateNotificationSetting('marketing_emails', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Security/Danger Zone Tab */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                      <div className="flex items-start space-x-3">
                        <Trash2 className="h-6 w-6 text-red-400 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-red-400 mb-2">
                            Delete Account
                          </h3>
                          <p className="text-sm text-red-300 mb-4">
                            Permanently delete your account and all associated data. This action cannot be undone.
                            All clients, projects, time entries, and invoices will be permanently removed.
                          </p>
                          
                          {!showDeleteConfirmation ? (
                            <button
                              onClick={() => setShowDeleteConfirmation(true)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Delete Account
                            </button>
                          ) : (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-red-300 mb-2">
                                  Type "DELETE" to confirm account deletion:
                                </label>
                                <input
                                  type="text"
                                  value={deleteConfirmation}
                                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                                  className="w-full max-w-xs bg-slate-700 border border-red-500 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                  placeholder="Type DELETE"
                                />
                              </div>
                              <div className="flex space-x-3">
                                <button
                                  onClick={handleDeleteAccount}
                                  disabled={deleteConfirmation !== 'DELETE' || deleting}
                                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors"
                                >
                                  {deleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                  <span>{deleting ? 'Deleting...' : 'Confirm Delete'}</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setShowDeleteConfirmation(false)
                                    setDeleteConfirmation('')
                                  }}
                                  className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}