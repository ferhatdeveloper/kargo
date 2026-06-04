-- Durum ve tip enumları (portal API smallint değerleri ile uyumlu)

CREATE TYPE user_status AS ENUM ('inactive', 'active', 'suspended');
CREATE TYPE user_type AS ENUM ('customer', 'staff', 'admin');

CREATE TYPE account_status AS ENUM ('inactive', 'active', 'suspended', 'closed');

CREATE TYPE member_role AS ENUM ('owner', 'admin', 'member', 'viewer');

CREATE TYPE cargo_status AS ENUM (
  'draft',
  'active',
  'in_transit',
  'delivered',
  'returned',
  'cancelled'
);

CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'issued', 'paid', 'cancelled', 'external');

CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'adjustment', 'refund');

CREATE TYPE ticket_status AS ENUM ('open', 'pending', 'resolved', 'closed');
CREATE TYPE ticket_priority AS ENUM ('low', 'normal', 'high', 'urgent');

CREATE TYPE integration_status AS ENUM ('inactive', 'active', 'error', 'pending');
CREATE TYPE market_order_status AS ENUM (
  'new',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned'
);

CREATE TYPE return_status AS ENUM ('requested', 'approved', 'in_transit', 'received', 'rejected', 'completed');

CREATE TYPE pod_status AS ENUM ('pending', 'collected', 'remitted', 'cancelled');

-- API uyumluluğu: smallint status kodları (mevcut frontend)
COMMENT ON TYPE cargo_status IS 'API: 1=active, 2=completed/delivered, 3=cancelled — cargo_status_code view ile eşlenir';
