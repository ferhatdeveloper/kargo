-- Row Level Security (JWT: sub = user_id)

CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::json ->> 'sub'
  )::uuid;
$$;

CREATE OR REPLACE FUNCTION auth_account_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT account_id
  FROM account_members
  WHERE user_id = auth_user_id();
$$;

CREATE OR REPLACE FUNCTION auth_has_account(p_account_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM account_members
    WHERE user_id = auth_user_id()
      AND account_id = p_account_id
  );
$$;

-- RLS etkinleştir
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cargo_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pay_on_delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_pricing_plans ENABLE ROW LEVEL SECURITY;

-- users: sadece kendi kaydı
CREATE POLICY users_select_self ON users
  FOR SELECT TO authenticated
  USING (id = auth_user_id());

CREATE POLICY users_update_self ON users
  FOR UPDATE TO authenticated
  USING (id = auth_user_id());

-- account_members
CREATE POLICY account_members_select ON account_members
  FOR SELECT TO authenticated
  USING (user_id = auth_user_id());

-- accounts
CREATE POLICY accounts_select ON accounts
  FOR SELECT TO authenticated
  USING (id IN (SELECT auth_account_ids()));

-- account_settings
CREATE POLICY account_settings_select ON account_settings
  FOR SELECT TO authenticated
  USING (auth_has_account(account_id));

CREATE POLICY account_settings_update ON account_settings
  FOR UPDATE TO authenticated
  USING (auth_has_account(account_id));

-- cargos
CREATE POLICY cargos_all ON cargos
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

-- cargo events via cargo
CREATE POLICY cargo_events_select ON cargo_status_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cargos c
      WHERE c.id = cargo_id AND auth_has_account(c.account_id)
    )
  );

CREATE POLICY cargo_items_all ON cargo_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cargos c
      WHERE c.id = cargo_id AND auth_has_account(c.account_id)
    )
  );

-- products, returns, finance, integrations, market, support
CREATE POLICY products_all ON products
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY returns_all ON returns
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY return_items_all ON return_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM returns r
      WHERE r.id = return_id AND auth_has_account(r.account_id)
    )
  );

CREATE POLICY invoices_all ON invoices
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY invoice_lines_all ON invoice_lines
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      WHERE i.id = invoice_id AND auth_has_account(i.account_id)
    )
  );

CREATE POLICY accounting_all ON accounting_transactions
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY pod_all ON pay_on_delivery_records
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY integrations_all ON integrations
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY market_orders_all ON market_orders
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY market_order_items_all ON market_order_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM market_orders mo
      WHERE mo.id = market_order_id AND auth_has_account(mo.account_id)
    )
  );

CREATE POLICY tickets_all ON support_tickets
  FOR ALL TO authenticated
  USING (auth_has_account(account_id))
  WITH CHECK (auth_has_account(account_id));

CREATE POLICY ticket_messages_all ON ticket_messages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets t
      WHERE t.id = ticket_id AND auth_has_account(t.account_id)
    )
  );

CREATE POLICY addresses_all ON addresses
  FOR ALL TO authenticated
  USING (account_id IS NULL OR auth_has_account(account_id))
  WITH CHECK (account_id IS NULL OR auth_has_account(account_id));

CREATE POLICY account_pricing_select ON account_pricing_plans
  FOR SELECT TO authenticated
  USING (auth_has_account(account_id));

-- Referans tablolar: herkese okuma
ALTER TABLE cargo_companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY cargo_companies_read ON cargo_companies
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricing_plans_read ON pricing_plans
  FOR SELECT TO anon, authenticated
  USING (is_public = TRUE);

GRANT SELECT ON cargo_companies TO anon, authenticated;
GRANT SELECT ON pricing_plans TO anon, authenticated;
