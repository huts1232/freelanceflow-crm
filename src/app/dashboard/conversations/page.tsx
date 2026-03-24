'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'
import { MessageCircle, Calendar, Clock, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
  )
}

interface Conversation {
  id: string
  chatbot_name: string
  visitor_message: string
  response: string
  created_at: string
  duration_seconds: number
}

export default function ConversationsPage() {
  const supabase = useMemo(() => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), [])
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response:', data, error)

      if (error) {
        console.error('Supabase error:', error)
        setError(error.message)
        return
      }

      const formattedConversations = (data || []).map(conv => ({
        id: conv.id,
        chatbot_name: conv.chatbot_name || 'Unknown Chatbot',
        visitor_message: conv.visitor_message || 'No message',
        response: conv.response || 'No response',
        created_at: conv.created_at,
        duration_seconds: conv.duration_seconds || 0
      }))

      setConversations(formattedConversations)
    } catch (err) {
      console.error('Fetch conversations error:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [])

  if (error) {
    return <ErrorFallback error={error} />
  }

  try {
    return (
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <div className="border-b border-slate-700 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">Conversations</h1>
                    <p className="text-slate-400 text-sm">
                      View all chatbot conversations and interactions
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-slate-400">
                {conversations.length} total conversations
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-800 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Your chatbot conversations will appear here once visitors start interacting with your chatbots.
              </p>
              <Link
                href="/dashboard/chatbots"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Manage Chatbots
              </Link>
            </div>
          ) : (
            <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-750 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Chatbot
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Visitor Message
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Response
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {conversations.map((conversation) => (
                      <tr key={conversation.id} className="hover:bg-slate-750/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-1.5 bg-purple-500/20 rounded-lg">
                              <User className="w-4 h-4 text-purple-400" />
                            </div>
                            <span className="font-medium text-white">
                              {conversation.chatbot_name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-slate-300 truncate" title={conversation.visitor_message}>
                              {conversation.visitor_message}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-slate-300 truncate" title={conversation.response}>
                              {conversation.response}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">
                              {formatDate(conversation.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              {formatDuration(conversation.duration_seconds)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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