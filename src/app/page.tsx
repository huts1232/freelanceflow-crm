'use client'

import Link from 'next/link'
import { useState } from 'react'

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

export default function LandingPage() {
  const [error, setError] = useState<string>('')

  if (error) {
    return <ErrorFallback error={error} />
  }

  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FF</span>
                </div>
                <span className="ml-2 text-white font-bold text-xl">FreelanceFlow</span>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Testimonials</a>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              </div>

              {/* Get Started Button */}
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Simple Client Management
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                For Freelancers
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Track projects, manage clients, log time, and create invoices - all in one beautiful, intuitive platform built specifically for independent professionals.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg"
              >
                Start Free Trial
              </Link>
              <button className="border border-white/20 text-white px-8 py-4 rounded-xl hover:bg-white/5 transition-all font-semibold text-lg">
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <p className="text-gray-500 text-sm">
              <span className="text-purple-400 font-semibold">1,000+ freelancers</span> trust FreelanceFlow CRM
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Everything you need to run your business
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                From client management to invoicing, FreelanceFlow has all the tools to help you stay organized and get paid faster.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Client Management</h3>
                <p className="text-gray-400">
                  Keep all client information, communication history, and project details organized in one place. Never lose track of important conversations.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Time Tracking</h3>
                <p className="text-gray-400">
                  Track time spent on projects with precision. Automatic timers, manual entries, and detailed reporting to maximize your billable hours.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Smart Invoicing</h3>
                <p className="text-gray-400">
                  Generate professional invoices in seconds. Automatic calculations, payment tracking, and reminders help you get paid faster.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Project Pipeline</h3>
                <p className="text-gray-400">
                  Visualize your project pipeline from initial contact to completion. Track progress, deadlines, and deliverables with ease.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Communication Hub</h3>
                <p className="text-gray-400">
                  Keep all client communications organized. Email tracking, notes, and follow-up reminders ensure nothing falls through the cracks.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics & Reports</h3>
                <p className="text-gray-400">
                  Get insights into your business performance. Track revenue, time allocation, and client profitability with detailed reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Choose the plan that fits your business needs. No hidden fees, no surprises.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
                <div className="text-3xl font-bold text-white mb-4">$0<span className="text-gray-400 text-lg">/month</span></div>
                <p className="text-gray-400 mb-6">Perfect for getting started</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to 3 clients
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic time tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Simple invoicing
                  </li>
                </ul>
                <Link 
                  href="/signup"
                  className="w-full bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors text-center block font-semibold"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-white/5 border-2 border-purple-500 rounded-2xl p-8 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                <div className="text-3xl font-bold text-white mb-4">$19<span className="text-gray-400 text-lg">/month</span></div>
                <p className="text-gray-400 mb-6">For growing freelancers</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited clients
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced time tracking
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Professional invoicing
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Project pipeline
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Analytics & reports
                  </li>
                </ul>
                <Link 
                  href="/signup"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-center block font-semibold"
                >
                  Start Pro Trial
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                <div className="text-3xl font-bold text-white mb-4">$49<span className="text-gray-400 text-lg">/month</span></div>
                <p className="text-gray-400 mb-6">For agencies & teams</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Everything in Pro
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Team collaboration
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Custom branding
                  </li>
                  <li className="flex items-center text-gray-300">
                    <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Link 
                  href="/signup"
                  className="w-full bg-white/10 text-white py-3 rounded-lg hover:bg-white/20 transition-colors text-center block font-semibold"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Loved by freelancers worldwide
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                See what our users have to say about how FreelanceFlow transformed their business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    SM
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-semibold">Sarah Martinez</h4>
                    <p className="text-gray-500 text-sm">Web Designer</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "FreelanceFlow completely transformed how I manage my clients. I've increased my revenue by 40% just by being more organized and never missing follow-ups."
                </p>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-semibold">James Davidson</h4>
                    <p className="text-gray-500 text-sm">Marketing Consultant</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "The time tracking and invoicing features are incredible. I save 5+ hours per week on admin work and get paid 50% faster than before."
                </p>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    AC
                  </div>
                  <div className="ml-4">
                    <h4 className="text-white font-semibold">Alex Chen</h4>
                    <p className="text-gray-500 text-sm">Software Developer</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  "Finally, a CRM built specifically for freelancers. The project pipeline view helps me stay on top of all my deadlines and impress clients with my professionalism."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/20 rounded-3xl p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to grow your freelance business?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of freelancers who've streamlined their workflow and increased their revenue with FreelanceFlow CRM.
            </p>
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold text-lg inline-block"
            >
              Start Free Today
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Logo & Description */}
              <div className="md:col-span-2">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">FF</span>
                  </div>
                  <span className="ml-2 text-white font-bold text-xl">FreelanceFlow</span>
                </div>
                <p className="text-gray-400 max-w-md">
                  Simple client management for independent professionals. Track projects, manage clients, and get paid faster.
                </p>
              </div>

              {/* Product Links */}
              <div>
                <h5 className="text-white font-semibold mb-4">Product</h5>
                <ul className="space-y-2">
                  <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                  <li><Link href="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
                  <li><Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </div>

              {/* Company Links */}
              <div>
                <h5 className="text-white font-semibold mb-4">Company</h5>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            {/* Copyright */}
            <div className="border-t border-gray-800 pt-8">
              <p className="text-gray-400 text-center">
                © 2024 FreelanceFlow CRM. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    )
  } catch (e) {
    return <ErrorFallback error={(e as Error).message} />
  }
}