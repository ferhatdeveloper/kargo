-- Pazaryeri siparişleri ve entegrasyonlar

CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  provider_code TEXT NOT NULL,
  title TEXT NOT NULL,
  status integration_status NOT NULL DEFAULT 'pending',
  credentials_encrypted BYTEA,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, provider_code)
);

CREATE INDEX idx_integrations_account ON integrations (account_id);

CREATE TRIGGER tr_integrations_updated_at
  BEFORE UPDATE ON integrations
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE market_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations (id) ON DELETE SET NULL,
  cargo_id UUID REFERENCES cargos (id) ON DELETE SET NULL,
  external_order_id TEXT NOT NULL,
  marketplace TEXT NOT NULL,
  status market_order_status NOT NULL DEFAULT 'new',
  customer_name TEXT,
  customer_phone TEXT,
  order_total NUMERIC(12, 2),
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  order_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ordered_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, integration_id, external_order_id)
);

CREATE INDEX idx_market_orders_account ON market_orders (account_id, status);
CREATE INDEX idx_market_orders_external ON market_orders (external_order_id);

CREATE TRIGGER tr_market_orders_updated_at
  BEFORE UPDATE ON market_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE market_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market_order_id UUID NOT NULL REFERENCES market_orders (id) ON DELETE CASCADE,
  product_id UUID REFERENCES products (id) ON DELETE SET NULL,
  sku TEXT,
  title TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_order_items_order ON market_order_items (market_order_id);
