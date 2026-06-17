'use client'

// src/app/login/page.tsx
// ============================================================
// AC-1.1: Login required before any feature accessible
// AC-1.2: Single user, no self-registration
// AC-1.3: Valid credentials → redirect to dashboard
// AC-1.4: Invalid credentials → clear error, no access
// AC-1.5: Session persists, logout available
// ============================================================

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import './login.css'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // AC-1.4: clear error message, no access granted
      setError('Email atau password salah. Silakan coba lagi.')
      setLoading(false)
      return
    }

    // AC-1.3: successful login → dashboard
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="login-page">
      {/* ===================== LEFT PANEL — Visual Branding ===================== */}
      <div className="login-left-panel">
        {/* Animated gradient background */}
        <div className="login-gradient-bg" />

        {/* Floating grid pattern */}
        <div className="login-grid-overlay" />

        {/* Animated blobs */}
        <div className="login-blob login-blob-1" />
        <div className="login-blob login-blob-2" />
        <div className="login-blob login-blob-3" />

        {/* Abstract bar chart */}
        <div className="login-chart">
          <div className="login-chart-bar login-chart-bar-1" />
          <div className="login-chart-bar login-chart-bar-2" />
          <div className="login-chart-bar login-chart-bar-3" />
          <div className="login-chart-bar login-chart-bar-4" />
          <div className="login-chart-bar login-chart-bar-5" />
          <div className="login-chart-bar login-chart-bar-6" />
          <div className="login-chart-bar login-chart-bar-7" />
        </div>

        {/* Floating data points */}
        <div className="login-data-point login-dp-1">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <circle cx="10" cy="10" r="3" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <div className="login-data-point login-dp-2">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
            <line x1="5" y1="11" x2="8" y2="5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="8" y1="5" x2="11" y2="8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div className="login-data-point login-dp-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="rgba(255,255,255,0.08)" />
          </svg>
        </div>
        <div className="login-data-point login-dp-4">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M9 4V9L12 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>

        {/* Abstract line chart */}
        <svg className="login-line-chart" viewBox="0 0 200 80" fill="none">
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="200" y2="0">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <linearGradient id="areaGrad" x1="100" y1="0" x2="100" y2="80">
              <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
          <path d="M0 60 Q25 55 40 45 T80 30 T120 35 T160 20 T200 25" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
          <path d="M0 60 Q25 55 40 45 T80 30 T120 35 T160 20 T200 25 V80 H0 Z" fill="url(#areaGrad)" />
        </svg>

        {/* Branding content */}
        <div className="login-brand-content">
          <div className="login-brand-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="rgba(255,255,255,0.15)" />
              <text x="20" y="26" textAnchor="middle" fill="white" fontSize="16" fontWeight="700" fontFamily="Inter, sans-serif">HL</text>
            </svg>
          </div>
          <h2 className="login-brand-title">HL Finance</h2>
          <p className="login-brand-subtitle">
            Platform manajemen penjualan & keuangan internal
          </p>
          <div className="login-brand-features">
            <div className="login-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              <span>Analitik Real-time</span>
            </div>
            <div className="login-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="1" y="4" width="22" height="16" rx="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <span>Manajemen Transaksi</span>
            </div>
            <div className="login-feature-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>Data Pelanggan</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== RIGHT PANEL — Login Form ===================== */}
      <div className="login-right-panel">
        <div className="login-form-wrapper">
          {/* Mobile logo (hidden on desktop) */}
          <div className="login-mobile-logo">
            <div className="login-mobile-logo-icon">
              <span>HL</span>
            </div>
          </div>

          <div className="login-form-header">
            <h1 id="login-heading">Selamat Datang</h1>
            <p>Masuk ke akun admin Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="login-form" id="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M22 4L12 13L2 4" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hl.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrapper">
                <svg className="login-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* AC-1.4: Error message */}
            {error && (
              <div className="login-error" id="login-error">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="login-submit-btn"
              id="login-submit"
            >
              {loading ? (
                <>
                  <svg className="login-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="login-spinner-track"
                      cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="3"
                    />
                    <path
                      className="login-spinner-head"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Masuk...
                </>
              ) : (
                <>
                  Masuk
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* AC-1.2: No self-registration — sengaja tidak ada link "Daftar" */}
          <p className="login-footer">
            HL Internal App · Akses hanya untuk admin
          </p>
        </div>
      </div>
    </div>
  )
}
