// src/app/dashboard/layout.tsx
// Layout utama setelah login — sidebar + main content

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import './dashboard.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Double-check auth (middleware sudah handle ini, ini safety net)
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="dashboard-shell">
      <Sidebar userEmail={user.email ?? ''} />
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
