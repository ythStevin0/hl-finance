# HL Finance — Sales & Receivables Management App

Internal app untuk manajemen pelanggan, produk, transaksi, piutang, bonus, dan laporan bisnis "HL".

## 🚀 Live Demo

**URL:** `https://hl-finance.vercel.app` _(ganti dengan URL deploy kamu)_

**Demo Credentials:**
```
Email:    admin@hl.com
Password: [isi setelah buat user di Supabase]
```

---

## 🛠️ Tech Stack & Fitur Utama

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS dengan **Premium Dark Navy Theme**
- **Database & Auth:** Supabase (PostgreSQL + Supabase Auth + RLS)
- **Form validation:** React Hook Form + Zod
- **PDF Export:** @react-pdf/renderer
- **Date utility:** date-fns

---

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- Akun Supabase (gratis di supabase.com)

---

## ⚙️ Setup Lokal

### 1. Clone & Install

```bash
git clone https://github.com/USERNAME/hl-finance.git
cd hl-finance
npm install
```

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Isi `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Nilai ini bisa ditemukan di: **Supabase Dashboard → Settings → API**

### 3. Setup Database

Buka **Supabase Dashboard → SQL Editor**, copy-paste dan jalankan isi seluruh file:
```
supabase_schema.sql
```
*(Catatan: Pastikan semua baris termasuk GRANT dan RLS Policy berhasil dieksekusi agar aplikasi memiliki izin akses database yang tepat).*

### 4. Buat User (1 user, tidak ada self-registration)

Di **Supabase Dashboard → Authentication → Users → Add user**:
- Email: `admin@hl.com` (bebas)
- Password: buat yang kuat
- ✅ Centang "Auto Confirm User"

Catat credentials ini untuk demo.

### 5. Jalankan Dev Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Struktur Database

| Tabel / View | Keterangan |
|--------------|-----------|
| `customers` | Data pelanggan + bonus threshold |
| `customer_discount_steps` | Diskon bertingkat per customer per tipe (LM/BR) |
| `products` | Produk dengan harga modal, harga base, tipe LM/BR |
| `transactions` | Bon/invoice dengan status Piutang/Lunas |
| `transaction_items` | Line items per bon (snapshot harga saat transaksi) |
| `bonus_grants` | Log bonus yang sudah diberikan |
| `customer_summary` | *(View)* Rekap total omzet, laba, piutang per pelanggan |

---

## 📐 Business Rules Penting

- **Cascading discount:** B × (1-d1/100) × (1-d2/100) × ... — bukan sum
- **Cash basis:** Omzet & laba hanya diakui saat status = Lunas
- **Ongkir:** Pass-through — masuk piutang tapi tidak masuk laba
- **Bonus accumulator:** Hanya dari transaksi Lunas bukan bonus
- **Soft delete:** Customer & product yang dihapus tetap muncul di history

---

## 🚀 Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard atau:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 📁 Struktur Folder Terbaru

```
src/
├── app/
│   ├── login/           # Auth pages (Premium UI)
│   ├── dashboard/       # Dashboard & statistik
│   │   ├── bonus/       # Pengelolaan & klaim bonus
│   │   ├── customers/   # Customer CRUD + detail
│   │   ├── products/    # Product CRUD
│   │   ├── transactions/# Bon management
│   │   └── reports/     # Laporan & export PDF
├── components/
│   ├── layout/          # Sidebar, navbar (Dark Navy Theme)
│   ├── ui/              # Reusable components
│   └── forms/           # Form components
├── lib/
│   ├── supabase/        # Client, server, types
│   ├── actions/         # Server Actions (Pemisahan Logika)
│   └── calculations.ts  # Core business logic
└── middleware.ts         # Auth protection
```
