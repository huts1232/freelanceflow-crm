'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function ErrorFallback({ error }: { error: string }) {
  return <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8"><div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl p-6 max-w-md"><h2 className="text-lg font-bold mb-2">Something went wrong</h2><p className="text-sm">{error}</p></div></div>
}

function Spinner() {
  return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
}

export default function SignUpPage() {
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const supabase = useMemo(() => 
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), 
    []
  )

  if (error) {
    return <ErrorFallback error={error} />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Starting signup flow for:', email)

      // Step 1: Try admin login first
      try {
        const adminResponse = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, adminKey: 'vaxario-admin-2024' })
        })
        console.log('Admin login response:', adminResponse.status)
      } catch (adminError) {
        console.log('Admin login failed (expected for regular users):', adminError)
      }

      // Step 2: Try to sign in first
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        console.log('Sign in attempt:', signInData, signInError)

        if (signInData.user && !signInError) {
          console.log('Sign in successful, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
      } catch (signInErr) {
        console.log('Sign in failed, will try signup:', signInErr)
      }

      // Step 3: If sign in fails, try signup
      console.log('Attempting signup...')
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      })
      console.log('Signup response:', signUpData, signUpError)

      if (signUpError) {
        throw signUpError
      }

      // Step 4: If signup successful, try signing in again
      if (signUpData.user) {
        console.log('Signup successful, attempting sign in...')
        const { data: finalSignInData, error: finalSignInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        console.log('Final sign in attempt:', finalSignInData, finalSignInError)

        if (finalSignInData.user && !finalSignInError) {
          // Create user data record
          try {
            const { data: userData, error: userDataError } = await supabase
              .from('users_data')
              .insert({
                user_id: finalSignInData.user.id
              })
            console.log('User data creation:', userData, userDataError)
          } catch (userDataErr) {
            console.log('User data creation failed (may already exist):', userDataErr)
          }

          console.log('Final sign in successful, redirecting to dashboard')
          router.push('/dashboard')
          return
        }

        if (finalSignInError) {
          throw finalSignInError
        }
      }

      throw new Error('Signup completed but unable to sign in')

    } catch (err) {
      console.error('Signup error:', err)
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Google signup error:', err)
      setError((err as Error).message)
      setIsLoading(false)
    }
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            {/* Logo/Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl mb-4">
                <div className="w-8 h-8 bg-white rounded-lg"></div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Join FreelanceFlow</h1>
              <p className="text-slate-400">Simple client management for independent professionals</p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Create a password (min 6 characters)"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isLoading ? <Spinner /> : <span>Create Account</span>}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600/50"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-slate-800/50 text-slate-400">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="mt-4 w-full bg-white text-slate-900 py-3 px-6 rounded-xl font-semibold hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Sign up with Google</span>
                  </>
                )}
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          {/* Pricing note */}
          <div className="text-center mt-6">
            <p className="text-slate-400 text-sm">
              Start your free trial • Only $19/month after
            </p>
          </div>
        </div>
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}