// src/app/page.tsx
// Root "/" → redirect ke dashboard (middleware akan redirect ke login kalau belum auth)
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
