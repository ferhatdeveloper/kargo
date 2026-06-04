-- Ürünler ve iadeler

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  barcode TEXT,
  title TEXT NOT NULL,
  description TEXT,
  unit_price NUMERIC(12, 2),
  weight_kg NUMERIC(8, 3),
  desi NUMERIC(8, 2),
  stock_quantity INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, sku)
);

CREATE INDEX idx_products_account ON products (account_id);
CREATE INDEX idx_products_sku ON products (account_id, sku);

ALTER TABLE cargo_items
  ADD CONSTRAINT cargo_items_product_fk
  FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL;

CREATE TRIGGER tr_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  cargo_id UUID REFERENCES cargos (id) ON DELETE SET NULL,
  return_number TEXT,
  status return_status NOT NULL DEFAULT 'requested',
  reason TEXT,
  notes TEXT,
  requested_by UUID REFERENCES users (id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_returns_account ON returns (account_id);
CREATE INDEX idx_returns_cargo ON returns (cargo_id);

CREATE TRIGGER tr_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID NOT NULL REFERENCES returns (id) ON DELETE CASCADE,
  product_id UUID REFERENCES products (id) ON DELETE SET NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  condition_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_return_items_return ON return_items (return_id);
