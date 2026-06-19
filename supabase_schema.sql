-- ============================================================
-- HL Sales & Receivables Management App
-- Supabase Schema — Run ini di SQL Editor Supabase
-- ============================================================

-- ============================================================
-- 1. CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama          TEXT NOT NULL,
  bonus_threshold BIGINT NOT NULL DEFAULT 10000000, -- dalam Rupiah
  soft_deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Discount steps per customer per type (LM / BR)
-- step_order menentukan urutan cascade: 0, 1, 2, ...
CREATE TABLE customer_discount_steps (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('LM', 'BR')),
  step_order  INTEGER NOT NULL,  -- 0-based, urutan penting!
  value       NUMERIC(5,2) NOT NULL CHECK (value >= 0 AND value <= 100),
  UNIQUE (customer_id, type, step_order)
);

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama            TEXT NOT NULL,
  harga_modal     BIGINT NOT NULL DEFAULT 0 CHECK (harga_modal >= 0),  -- cost price, IDR
  harga_base      BIGINT NOT NULL DEFAULT 0 CHECK (harga_base >= 0),  -- list price, IDR
  type            TEXT NOT NULL CHECK (type IN ('LM', 'BR')),
  soft_deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. TRANSACTIONS (BON)
-- ============================================================
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor_bon       TEXT NOT NULL UNIQUE,   -- AC-4.2: must be unique
  tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id     UUID NOT NULL REFERENCES customers(id),
  ongkir          BIGINT NOT NULL DEFAULT 0 CHECK (ongkir >= 0),
  deskripsi       TEXT DEFAULT '',
  is_bonus        BOOLEAN NOT NULL DEFAULT FALSE,  -- AC-5.5
  status          TEXT NOT NULL DEFAULT 'piutang' CHECK (status IN ('piutang', 'lunas')),
  payment_date    DATE DEFAULT NULL,  -- diisi saat settle
  -- Snapshot totals (dihitung saat save/update, disimpan untuk query cepat)
  total_omzet     BIGINT NOT NULL DEFAULT 0,  -- Σ line omzet, excl ongkir
  total_laba      BIGINT NOT NULL DEFAULT 0,  -- Σ line laba HL
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. TRANSACTION ITEMS (line items per Bon)
-- ============================================================
CREATE TABLE transaction_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id        UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES products(id),
  -- Snapshot harga saat transaksi dibuat — CRITICAL agar history akurat
  -- kalau harga produk berubah di masa depan
  product_nama          TEXT NOT NULL,  -- snapshot nama
  product_type          TEXT NOT NULL CHECK (product_type IN ('LM', 'BR')),
  harga_base_snapshot   BIGINT NOT NULL,  -- snapshot harga base
  harga_modal_snapshot  BIGINT NOT NULL,  -- snapshot harga modal (untuk laba)
  discounted_unit_price BIGINT NOT NULL,  -- hasil cascading discount
  qty                   INTEGER NOT NULL CHECK (qty >= 1),
  -- Computed & stored (bisa dihitung ulang tapi disimpan untuk query efisien)
  line_omzet            BIGINT NOT NULL,  -- discounted_unit_price × qty
  line_laba             BIGINT NOT NULL,  -- (discounted_unit_price - modal) × qty
  -- Untuk bonus lines: is_free = TRUE → omzet & laba = 0 (AC-5.7)
  is_free               BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================
-- 5. BONUS GRANTS (log bonus yang sudah diberikan)
-- ============================================================
CREATE TABLE bonus_grants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  transaction_id  UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  -- Berapa bonus dikonsumsi di bon ini (AC-5.5: bisa multiple dalam 1 bon)
  quantity_granted INTEGER NOT NULL CHECK (quantity_granted >= 1),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. INDEXES untuk performa query
-- ============================================================
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_tanggal ON transactions(tanggal);
CREATE INDEX idx_transaction_items_transaction_id ON transaction_items(transaction_id);
CREATE INDEX idx_bonus_grants_customer_id ON bonus_grants(customer_id);
CREATE INDEX idx_customer_discount_steps_customer_id ON customer_discount_steps(customer_id);

-- ============================================================
-- 7. HELPER VIEWS untuk query yang sering dipakai
-- ============================================================

-- View: customer aktif (belum soft-delete)
CREATE VIEW active_customers AS
  SELECT * FROM customers WHERE soft_deleted_at IS NULL;

-- View: product aktif (belum soft-delete)
CREATE VIEW active_products AS
  SELECT * FROM products WHERE soft_deleted_at IS NULL;

-- View: rekap per customer (untuk laporan)
-- Hanya transaksi LUNAS yang masuk omzet & laba (cash basis - D3)
CREATE VIEW customer_summary AS
  SELECT
    c.id AS customer_id,
    c.nama,
    -- Omzet per type (hanya lunas, bukan bonus)
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE AND ti.product_type = 'LM' THEN ti.line_omzet ELSE 0 END), 0) AS omzet_lm,
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE AND ti.product_type = 'BR' THEN ti.line_omzet ELSE 0 END), 0) AS omzet_br,
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE THEN ti.line_omzet ELSE 0 END), 0) AS total_omzet_lunas,
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE THEN ti.line_laba ELSE 0 END), 0) AS total_laba_lunas,
    -- Piutang = omzet + ongkir dari transaksi belum lunas (bukan bonus)
    COALESCE(SUM(CASE WHEN t.status = 'piutang' AND t.is_bonus = FALSE THEN t.total_omzet + t.ongkir ELSE 0 END), 0) AS total_piutang,
    -- Sudah dibayar = omzet + ongkir dari lunas
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE THEN t.total_omzet + t.ongkir ELSE 0 END), 0) AS total_sudah_dibayar,
    -- Bonus accumulator untuk eligibility check (AC-5.2)
    COALESCE(SUM(CASE WHEN t.status = 'lunas' AND t.is_bonus = FALSE THEN t.total_omzet ELSE 0 END), 0) AS bonus_accumulator,
    -- Bonus sudah diberikan
    COALESCE((SELECT SUM(bg.quantity_granted) FROM bonus_grants bg WHERE bg.customer_id = c.id), 0) AS bonuses_granted
  FROM customers c
  LEFT JOIN transactions t ON t.customer_id = c.id
  LEFT JOIN transaction_items ti ON ti.transaction_id = t.id
  WHERE c.soft_deleted_at IS NULL
  GROUP BY c.id, c.nama;

-- ============================================================
-- 8. UPDATED_AT trigger untuk transactions
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) & PRIVILEGES
-- Pastikan role aplikasi ('authenticated' & 'anon') bisa mengakses tabel
-- ============================================================
GRANT ALL ON TABLE products TO authenticated, anon;
GRANT ALL ON TABLE customers TO authenticated, anon;
GRANT ALL ON TABLE transactions TO authenticated, anon;
GRANT ALL ON TABLE transaction_items TO authenticated, anon;
GRANT ALL ON TABLE customer_discount_steps TO authenticated, anon;
GRANT ALL ON TABLE bonus_grants TO authenticated, anon;

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_discount_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_grants ENABLE ROW LEVEL SECURITY;

-- Policy: Izinkan akses penuh untuk aplikasi (app-level security via Next.js middleware)
CREATE POLICY "Enable full access for app" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for app" ON customer_discount_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for app" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for app" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for app" ON transaction_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable full access for app" ON bonus_grants FOR ALL USING (true) WITH CHECK (true);
