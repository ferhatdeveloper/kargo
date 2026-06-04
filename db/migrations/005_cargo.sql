-- Kargo firmaları, gönderiler, adresler, hareketler

CREATE TABLE cargo_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  supports_domestic BOOLEAN NOT NULL DEFAULT TRUE,
  supports_abroad BOOLEAN NOT NULL DEFAULT FALSE,
  supports_pod BOOLEAN NOT NULL DEFAULT TRUE,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_cargo_companies_updated_at
  BEFORE UPDATE ON cargo_companies
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID REFERENCES accounts (id) ON DELETE CASCADE,
  label TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  country_code CHAR(2) NOT NULL DEFAULT 'TR',
  city TEXT NOT NULL,
  district TEXT,
  neighborhood TEXT,
  address_line TEXT NOT NULL,
  postal_code TEXT,
  tax_number TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_addresses_account ON addresses (account_id);

CREATE TRIGGER tr_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE cargos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  cargo_company_id UUID REFERENCES cargo_companies (id) ON DELETE SET NULL,
  created_by UUID REFERENCES users (id) ON DELETE SET NULL,
  tracking_number TEXT,
  external_order_id TEXT,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT,
  receiver_email TEXT,
  status cargo_status NOT NULL DEFAULT 'draft',
  status_code SMALLINT GENERATED ALWAYS AS (
    CASE status
      WHEN 'active' THEN 1
      WHEN 'in_transit' THEN 1
      WHEN 'delivered' THEN 2
      WHEN 'cancelled' THEN 3
      WHEN 'returned' THEN 3
      ELSE 1
    END
  ) STORED,
  pay_on_delivery BOOLEAN NOT NULL DEFAULT FALSE,
  pod_amount NUMERIC(12, 2),
  declared_value NUMERIC(12, 2),
  weight_kg NUMERIC(8, 3),
  desi NUMERIC(8, 2),
  package_count INT NOT NULL DEFAULT 1,
  content_description TEXT,
  sender_address_id UUID REFERENCES addresses (id) ON DELETE SET NULL,
  receiver_address_id UUID REFERENCES addresses (id) ON DELETE SET NULL,
  sender_snapshot JSONB,
  receiver_snapshot JSONB,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cargos_tracking_unique UNIQUE (account_id, tracking_number)
);

CREATE INDEX idx_cargos_account ON cargos (account_id);
CREATE INDEX idx_cargos_status ON cargos (account_id, status);
CREATE INDEX idx_cargos_tracking ON cargos (tracking_number);
CREATE INDEX idx_cargos_created ON cargos (account_id, created_at DESC);
CREATE INDEX idx_cargos_receiver ON cargos (account_id, receiver_name);

CREATE TRIGGER tr_cargos_updated_at
  BEFORE UPDATE ON cargos
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE cargo_status_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id UUID NOT NULL REFERENCES cargos (id) ON DELETE CASCADE,
  status cargo_status NOT NULL,
  description TEXT,
  location TEXT,
  source TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargo_events_cargo ON cargo_status_events (cargo_id, occurred_at DESC);

CREATE TABLE cargo_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id UUID NOT NULL REFERENCES cargos (id) ON DELETE CASCADE,
  product_id UUID,
  sku TEXT,
  title TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cargo_items_cargo ON cargo_items (cargo_id);
