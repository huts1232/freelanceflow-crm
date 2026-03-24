import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FreelanceFlow CRM — Simple client management for independent professionals",
  description: "A streamlined CRM designed specifically for freelancers to manage client relationships, track projects, and handle invoicing. Built to be simple enoug",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen bg-gray-50 antialiased">{children}</body></html>
}