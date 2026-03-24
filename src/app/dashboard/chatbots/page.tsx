'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Globe, MessageSquare, ToggleLeft, ToggleRight, Clock, X } from 'lucide-react'

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

interface Chatbot {
  id: string
  name: string
  description: string
  website_url: string
  welcome_message: string
  is_active: boolean
  created_at: string
}

export default function ChatbotsPage() {
  const [error, setError] = useState<string>('')
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const router = useRouter()

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      setError('Missing Supabase configuration')
      return null
    }
    return createClient(url, key)
  }, [])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website_url: '',
    welcome_message: ''
  })

  useEffect(() => {
    if (supabase) {
      fetchChatbots()
    }
  }, [supabase])

  const fetchChatbots = async () => {
    if (!supabase) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response:', data, error)

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }

      setChatbots(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    if (!formData.name.trim() || !formData.description.trim() || !formData.website_url.trim()) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setModalLoading(true)
      const { data, error } = await supabase
        .from('chatbots')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim(),
          website_url: formData.website_url.trim(),
          welcome_message: formData.welcome_message.trim() || 'Hello! How can I help you today?',
          is_active: true
        })
        .select()

      console.log('Supabase response:', data, error)

      if (error) {
        console.error('Supabase error:', error)
        alert(error.message)
        return
      }

      setFormData({
        name: '',
        description: '',
        website_url: '',
        welcome_message: ''
      })
      setShowModal(false)
      await fetchChatbots()
    } catch (err) {
      console.error('Submit error:', err)
      alert((err as Error).message)
    } finally {
      setModalLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    if (!confirm('Are you sure you want to delete this chatbot?')) return

    try {
      setDeleteLoading(id)
      const { error } = await supabase
        .from('chatbots')
        .delete()
        .eq('id', id)

      console.log('Supabase delete response:', error)

      if (error) {
        console.error('Supabase error:', error)
        alert(error.message)
        return
      }

      await fetchChatbots()
    } catch (err) {
      console.error('Delete error:', err)
      alert((err as Error).message)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!supabase) return

    try {
      setToggleLoading(id)
      const { error } = await supabase
        .from('chatbots')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      console.log('Supabase toggle response:', error)

      if (error) {
        console.error('Supabase error:', error)
        alert(error.message)
        return
      }

      await fetchChatbots()
    } catch (err) {
      console.error('Toggle error:', err)
      alert((err as Error).message)
    } finally {
      setToggleLoading(null)
    }
  }

  try {
    if (error) {
      return <ErrorFallback error={error} />
    }

    return (
      <div className="min-h-screen bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Chatbots</h1>
              <p className="text-slate-400 mt-2">Manage your automated customer support</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Create New Chatbot
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && chatbots.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">No chatbots yet</h3>
              <p className="text-slate-500 mb-6">Create your first chatbot to automate customer support</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Chatbot
              </button>
            </div>
          )}

          {/* Chatbots Grid */}
          {!loading && chatbots.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((chatbot) => (
                <div key={chatbot.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 transition-all duration-200 hover:shadow-xl">
                  {/* Status Toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      chatbot.is_active 
                        ? 'bg-green-400/20 text-green-400 border border-green-400/30'
                        : 'bg-slate-600/20 text-slate-400 border border-slate-600/30'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${chatbot.is_active ? 'bg-green-400' : 'bg-slate-400'}`}></div>
                      {chatbot.is_active ? 'Active' : 'Inactive'}
                    </div>
                    <button
                      onClick={() => handleToggleStatus(chatbot.id, chatbot.is_active)}
                      disabled={toggleLoading === chatbot.id}
                      className="text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {toggleLoading === chatbot.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                      ) : chatbot.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6" />
                      )}
                    </button>
                  </div>

                  {/* Chatbot Info */}
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2">{chatbot.name}</h3>
                    <p className="text-slate-400 text-sm mb-3">{chatbot.description}</p>
                    
                    {chatbot.website_url && (
                      <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="truncate">{chatbot.website_url}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      Created {new Date(chatbot.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Welcome Message Preview */}
                  <div className="bg-slate-700/50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-slate-400 mb-1">Welcome Message:</p>
                    <p className="text-sm text-slate-200 truncate">{chatbot.welcome_message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chatbot.id)}
                      disabled={deleteLoading === chatbot.id}
                      className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {deleteLoading === chatbot.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Create New Chatbot</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Customer Support Bot"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Helps customers with common questions and support requests"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Website URL *
                    </label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Welcome Message
                    </label>
                    <textarea
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      rows={3}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Hello! How can I help you today?"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 bg-slate-600 hover:bg-slate-500 text-white px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {modalLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Chatbot
                        </>
                      )}
                    </button>
                  </div>
                </form>
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