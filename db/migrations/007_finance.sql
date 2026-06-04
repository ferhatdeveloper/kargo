-- Faturalar, finans hareketleri, kapıda ödeme

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  cargo_id UUID REFERENCES cargos (id) ON DELETE SET NULL,
  invoice_number TEXT,
  status invoice_status NOT NULL DEFAULT 'draft',
  invoice_type TEXT NOT NULL DEFAULT 'sales',
  is_external BOOLEAN NOT NULL DEFAULT FALSE,
  subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  buyer_info JSONB,
  issuer_info JSONB,
  e_invoice_uuid TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT invoices_number_unique UNIQUE (account_id, invoice_number)
);

CREATE INDEX idx_invoices_account ON invoices (account_id);
CREATE INDEX idx_invoices_status ON invoices (account_id, status);
CREATE INDEX idx_invoices_cargo ON invoices (cargo_id);

CREATE TRIGGER tr_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

CREATE TABLE invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices (id) ON DELETE CASCADE,
  line_no INT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(12, 3) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 20,
  line_total NUMERIC(14, 2) NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (invoice_id, line_no)
);

CREATE INDEX idx_invoice_lines_invoice ON invoice_lines (invoice_id);

CREATE TABLE accounting_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  cargo_id UUID REFERENCES cargos (id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices (id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  balance_after NUMERIC(14, 2),
  currency CHAR(3) NOT NULL DEFAULT 'TRY',
  description TEXT NOT NULL,
  reference_no TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounting_account ON accounting_transactions (account_id, occurred_at DESC);
CREATE INDEX idx_accounting_cargo ON accounting_transactions (cargo_id);

CREATE TABLE pay_on_delivery_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
  cargo_id UUID NOT NULL REFERENCES cargos (id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  commission NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) GENERATED ALWAYS AS (amount - commission) STORED,
  status pod_status NOT NULL DEFAULT 'pending',
  collected_at TIMESTAMPTZ,
  remitted_at TIMESTAMPTZ,
  remittance_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (cargo_id)
);

CREATE INDEX idx_pod_account ON pay_on_delivery_records (account_id, status);

CREATE TRIGGER tr_pod_updated_at
  BEFORE UPDATE ON pay_on_delivery_records
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();
