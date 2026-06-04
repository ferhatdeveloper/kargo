-- Hesaplar (müşteri firmaları) ve üyelik

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_account_id UUID REFERENCES accounts (id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  eft_code TEXT,
  account_code TEXT NOT NULL UNIQUE,
  status account_status NOT NULL DEFAULT 'active',
  can_domestic BOOLEAN NOT NULL DEFAULT TRUE,
  can_abroad BOOLEAN NOT NULL DEFAULT FALSE,
  can_invoice BOOLEAN NOT NULL DEFAULT TRUE,
  can_pod BOOLEAN NOT NULL DEFAULT TRUE,
  has_sub_accounts BOOLEAN NOT NULL DEFAULT FALSE,
  balance NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  tax_number TEXT,
  tax_office TEXT,
  billing_address JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_parent ON accounts (parent_account_id);
CREATE INDEX idx_accounts_code ON accounts (account_code);
CREATE INDEX idx_accounts_status ON accounts (status);

CREATE TRIGGER tr_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE account_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'member',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (account_id, user_id)
);

CREATE INDEX idx_account_members_user ON account_members (user_id);
CREATE INDEX idx_account_members_account ON account_members (account_id);

CREATE TABLE account_settings (
  account_id UUID PRIMARY KEY REFERENCES accounts (id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  invoice_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  notification_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- Fiyat listeleri
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  valid_from DATE,
  valid_to DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER tr_pricing_plans_updated_at
  BEFORE UPDATE ON pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE account_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  pricing_plan_id UUID NOT NULL REFERENCES pricing_plans (id) ON DELETE RESTRICT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE (account_id, pricing_plan_id)
);

CREATE INDEX idx_account_pricing_account ON account_pricing_plans (account_id);
