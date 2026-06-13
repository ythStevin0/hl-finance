// src/lib/constants.ts
// ============================================================
// App-wide constants — tidak ada magic numbers di tempat lain
// ============================================================

export const PRODUCT_TYPES = ['LM', 'BR'] as const
export type ProductType = (typeof PRODUCT_TYPES)[number]

export const TRANSACTION_STATUSES = ['piutang', 'lunas'] as const
export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number]

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
] as const

export const MONTH_NAMES_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

// Dashboard
export const RECENT_TRANSACTIONS_LIMIT = 5

// Year range di selector (berapa tahun ke belakang & depan dari sekarang)
export const YEAR_RANGE_BACK = 2
export const YEAR_RANGE_FORWARD = 2

// Default bonus threshold baru customer
export const DEFAULT_BONUS_THRESHOLD = 10_000_000

// Discount validation
export const DISCOUNT_MIN = 0
export const DISCOUNT_MAX = 100
