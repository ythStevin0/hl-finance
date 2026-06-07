// src/lib/supabase/types.ts
// TypeScript types yang match dengan schema Supabase
// Idealnya di-generate otomatis: npx supabase gen types typescript --linked > src/lib/supabase/types.ts
// Tapi ini versi manual yang lengkap untuk development

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string
          nama: string
          bonus_threshold: number
          soft_deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          bonus_threshold?: number
          soft_deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          bonus_threshold?: number
          soft_deleted_at?: string | null
        }
      }
      customer_discount_steps: {
        Row: {
          id: string
          customer_id: string
          type: 'LM' | 'BR'
          step_order: number
          value: number
        }
        Insert: {
          id?: string
          customer_id: string
          type: 'LM' | 'BR'
          step_order: number
          value: number
        }
        Update: {
          value?: number
          step_order?: number
        }
      }
      products: {
        Row: {
          id: string
          nama: string
          harga_modal: number
          harga_base: number
          type: 'LM' | 'BR'
          soft_deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          harga_modal: number
          harga_base: number
          type: 'LM' | 'BR'
          soft_deleted_at?: string | null
        }
        Update: {
          nama?: string
          harga_modal?: number
          harga_base?: number
          type?: 'LM' | 'BR'
          soft_deleted_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          nomor_bon: string
          tanggal: string
          customer_id: string
          ongkir: number
          deskripsi: string
          is_bonus: boolean
          status: 'piutang' | 'lunas'
          payment_date: string | null
          total_omzet: number
          total_laba: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nomor_bon: string
          tanggal?: string
          customer_id: string
          ongkir?: number
          deskripsi?: string
          is_bonus?: boolean
          status?: 'piutang' | 'lunas'
          payment_date?: string | null
          total_omzet?: number
          total_laba?: number
        }
        Update: {
          nomor_bon?: string
          tanggal?: string
          ongkir?: number
          deskripsi?: string
          is_bonus?: boolean
          status?: 'piutang' | 'lunas'
          payment_date?: string | null
          total_omzet?: number
          total_laba?: number
        }
      }
      transaction_items: {
        Row: {
          id: string
          transaction_id: string
          product_id: string
          product_nama: string
          product_type: 'LM' | 'BR'
          harga_base_snapshot: number
          harga_modal_snapshot: number
          discounted_unit_price: number
          qty: number
          line_omzet: number
          line_laba: number
          is_free: boolean
        }
        Insert: {
          id?: string
          transaction_id: string
          product_id: string
          product_nama: string
          product_type: 'LM' | 'BR'
          harga_base_snapshot: number
          harga_modal_snapshot: number
          discounted_unit_price: number
          qty: number
          line_omzet: number
          line_laba: number
          is_free?: boolean
        }
        Update: {
          qty?: number
          discounted_unit_price?: number
          line_omzet?: number
          line_laba?: number
        }
      }
      bonus_grants: {
        Row: {
          id: string
          customer_id: string
          transaction_id: string
          quantity_granted: number
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          transaction_id: string
          quantity_granted: number
        }
        Update: never
      }
    }
    Views: {
      active_customers: {
        Row: Database['public']['Tables']['customers']['Row']
      }
      active_products: {
        Row: Database['public']['Tables']['products']['Row']
      }
      customer_summary: {
        Row: {
          customer_id: string
          nama: string
          omzet_lm: number
          omzet_br: number
          total_omzet_lunas: number
          total_laba_lunas: number
          total_piutang: number
          total_sudah_dibayar: number
          bonus_accumulator: number
          bonuses_granted: number
        }
      }
    }
  }
}

// ============================================================
// Derived / convenience types
// ============================================================

export type Customer = Database['public']['Tables']['customers']['Row']
export type CustomerInsert = Database['public']['Tables']['customers']['Insert']
export type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export type DiscountStep = Database['public']['Tables']['customer_discount_steps']['Row']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type TransactionItem = Database['public']['Tables']['transaction_items']['Row']
export type TransactionItemInsert = Database['public']['Tables']['transaction_items']['Insert']

export type BonusGrant = Database['public']['Tables']['bonus_grants']['Row']

export type CustomerSummary = Database['public']['Views']['customer_summary']['Row']

// Customer dengan discount steps (sering dipakai bersama)
export type CustomerWithDiscounts = Customer & {
  discount_steps_lm: DiscountStep[]
  discount_steps_br: DiscountStep[]
}

// Transaction dengan semua relasinya
export type TransactionWithItems = Transaction & {
  items: TransactionItem[]
  customer: Pick<Customer, 'id' | 'nama'>
}

export type ProductType = 'LM' | 'BR'
export type TransactionStatus = 'piutang' | 'lunas'
