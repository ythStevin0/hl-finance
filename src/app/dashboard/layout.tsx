// src/app/dashboard/layout.tsx
// Layout utama setelah login — sidebar + main content

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClientShell from '@/components/layout/DashboardClientShell'
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
    <DashboardClientShell userEmail={user.email ?? ''}>
      {children}
    </DashboardClientShell>
  )
}
