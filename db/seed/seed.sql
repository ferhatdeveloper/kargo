-- Demo veri (geliştirme)

INSERT INTO cargo_companies (code, title, supports_domestic, supports_abroad, supports_pod)
VALUES
  ('yurtici', 'Yurtiçi Kargo', TRUE, FALSE, TRUE),
  ('aras', 'Aras Kargo', TRUE, FALSE, TRUE),
  ('mng', 'MNG Kargo', TRUE, FALSE, TRUE),
  ('ptt', 'PTT Kargo', TRUE, FALSE, FALSE)
ON CONFLICT (code) DO NOTHING;

INSERT INTO pricing_plans (code, title, description, is_public)
VALUES
  ('standart', 'Standart Liste', 'Varsayılan fiyat listesi', TRUE),
  ('kurumsal', 'Kurumsal Liste', 'Yüksek hacim indirimleri', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Demo kullanıcı: demo@navlun.local / Demo123!
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status)
VALUES (
  'demo@navlun.local',
  crypt('Demo123!', gen_salt('bf')),
  'Demo',
  'Kullanıcı',
  '+905551234567',
  'customer',
  'active'
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO accounts (
  name, account_code, eft_code, can_domestic, can_abroad, can_invoice, can_pod, has_sub_accounts
)
VALUES (
  'Demo Lojistik A.Ş.',
  'DEMO001',
  'DEMOEFT',
  TRUE,
  FALSE,
  TRUE,
  TRUE,
  FALSE
)
ON CONFLICT (account_code) DO NOTHING;

INSERT INTO account_members (account_id, user_id, role, is_default)
SELECT a.id, u.id, 'owner', TRUE
FROM accounts a, users u
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@navlun.local'
ON CONFLICT (account_id, user_id) DO NOTHING;

INSERT INTO account_settings (account_id)
SELECT id FROM accounts WHERE account_code = 'DEMO001'
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO account_pricing_plans (account_id, pricing_plan_id)
SELECT a.id, p.id
FROM accounts a, pricing_plans p
WHERE a.account_code = 'DEMO001' AND p.code = 'standart'
ON CONFLICT DO NOTHING;

-- Örnek kargolar
INSERT INTO cargos (
  account_id,
  cargo_company_id,
  created_by,
  tracking_number,
  receiver_name,
  receiver_phone,
  status,
  pay_on_delivery,
  pod_amount,
  weight_kg,
  content_description
)
SELECT
  a.id,
  cc.id,
  u.id,
  'DEMO' || lpad(g::text, 8, '0'),
  'Alıcı ' || g,
  '+90555987' || lpad(g::text, 4, '0'),
  (ARRAY['active', 'in_transit', 'delivered', 'active', 'cancelled']::cargo_status[])[1 + (g % 5)],
  (g % 3 = 0),
  CASE WHEN g % 3 = 0 THEN 150.00 + g ELSE NULL END,
  1.5 + (g * 0.1),
  'Örnek paket içeriği #' || g
FROM accounts a
CROSS JOIN users u
CROSS JOIN generate_series(1, 12) g
LEFT JOIN cargo_companies cc ON cc.code = 'yurtici'
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@navlun.local'
ON CONFLICT (account_id, tracking_number) DO NOTHING;

INSERT INTO products (account_id, sku, title, unit_price, stock_quantity)
SELECT a.id, 'SKU-' || g, 'Ürün ' || g, 99.90 + g, 100 - g
FROM accounts a, generate_series(1, 5) g
WHERE a.account_code = 'DEMO001'
ON CONFLICT (account_id, sku) DO NOTHING;

INSERT INTO accounting_transactions (account_id, transaction_type, amount, description, reference_no)
SELECT a.id, 'debit', 45.50, 'Kargo gönderim ücreti', 'TXN-DEMO-001'
FROM accounts a WHERE a.account_code = 'DEMO001';

INSERT INTO integrations (account_id, provider_code, title, status, settings)
SELECT a.id, 'trendyol', 'Trendyol', 'active', '{"store_id":"demo"}'::jsonb
FROM accounts a WHERE a.account_code = 'DEMO001'
ON CONFLICT (account_id, provider_code) DO NOTHING;

INSERT INTO support_tickets (account_id, created_by, subject, status, priority)
SELECT a.id, u.id, 'Demo destek talebi', 'open', 'normal'
FROM accounts a, users u
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@navlun.local';
