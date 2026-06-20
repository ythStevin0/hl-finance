'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/layout/Sidebar'

interface Props {
  userEmail: string
  children: React.ReactNode
}

export default function DashboardClientShell({ userEmail, children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      {/* Mobile Topbar (hanya muncul di hp) */}
      <div className="dashboard-topbar">
        <div className="topbar-logo-group">
          <div className="topbar-logo">
            <span>HL</span>
          </div>
          <span className="topbar-title">HL Finance</span>
        </div>
        <button
          className="topbar-menu-btn"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Component */}
      <Sidebar 
        userEmail={userEmail} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content */}
      <main className="dashboard-main">
        {children}
      </main>
    </div>
  )
}
