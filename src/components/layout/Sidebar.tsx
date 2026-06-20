'use client'

// src/components/layout/Sidebar.tsx
// AC-1.5: logout option available
// Update fase 4: tambah menu Bonus

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Gift,
  BarChart3,
  LogOut,
  X
} from 'lucide-react'
import './sidebar.css'

const navItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    exact: true,
    icon: <LayoutDashboard className="sidebar-icon" />,
  },
  {
    href: '/dashboard/customers',
    label: 'Pelanggan',
    exact: false,
    icon: <Users className="sidebar-icon" />,
  },
  {
    href: '/dashboard/products',
    label: 'Produk',
    exact: false,
    icon: <Package className="sidebar-icon" />,
  },
  {
    href: '/dashboard/transactions',
    label: 'Transaksi (Bon)',
    exact: false,
    icon: <FileText className="sidebar-icon" />,
  },
  {
    href: '/dashboard/bonus',
    label: 'Bonus',
    exact: false,
    icon: <Gift className="sidebar-icon" />,
  },
  {
    href: '/dashboard/reports',
    label: 'Laporan',
    exact: false,
    icon: <BarChart3 className="sidebar-icon" />,
  },
]

interface SidebarProps {
  userEmail: string
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ userEmail, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Overlay untuk mobile saat sidebar terbuka */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span>HL</span>
          </div>
          <div className="flex-1">
            <p className="sidebar-brand-title">HL Finance</p>
            <p className="sidebar-brand-sub">Sales & Receivables</p>
          </div>
          {/* Tombol tutup khusus mobile */}
          {onClose && (
            <button 
              className="sidebar-close-btn" 
              onClick={onClose}
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                onClick={() => onClose?.()} // Tutup sidebar otomatis saat link diklik (di hp)
              >
              <span className="sidebar-link-icon">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout — AC-1.5 */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <span>{userEmail.charAt(0).toUpperCase()}</span>
          </div>
          <p className="sidebar-email">{userEmail}</p>
        </div>
        <button onClick={handleLogout} className="sidebar-logout">
          <LogOut className="sidebar-icon-sm" />
          Keluar
        </button>
      </div>
    </aside>
    </>
  )
}

