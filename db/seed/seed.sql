-- Demo veri (geliştirme)

INSERT INTO cargo_companies (code, title, supports_domestic, supports_abroad, supports_pod, config)
VALUES
  (
    'yurtici',
    'Yurtiçi Kargo',
    TRUE,
    FALSE,
    TRUE,
    '{"quote":{"estimated_days":"1-2","tiers":[{"up_to_desi":3,"price":137},{"up_to_desi":10,"price":151},{"up_to_desi":30,"price":235}],"overflow_base_desi":30,"overflow_base_price":235,"extra_per_desi":23.34,"pod_fee":12}}'::jsonb
  ),
  (
    'aras',
    'Aras Kargo',
    TRUE,
    FALSE,
    TRUE,
    '{"quote":{"estimated_days":"1-3","tiers":[{"up_to_desi":3,"price":142},{"up_to_desi":10,"price":158},{"up_to_desi":30,"price":248}],"overflow_base_desi":30,"overflow_base_price":248,"extra_per_desi":24.5,"pod_fee":14}}'::jsonb
  ),
  (
    'mng',
    'MNG Kargo',
    TRUE,
    FALSE,
    TRUE,
    '{"quote":{"estimated_days":"2-3","tiers":[{"up_to_desi":3,"price":135},{"up_to_desi":10,"price":149},{"up_to_desi":30,"price":232}],"overflow_base_desi":30,"overflow_base_price":232,"extra_per_desi":22.9,"pod_fee":11}}'::jsonb
  ),
  (
    'ptt',
    'PTT Kargo',
    TRUE,
    FALSE,
    FALSE,
    '{"quote":{"estimated_days":"2-4","tiers":[{"up_to_desi":3,"price":128},{"up_to_desi":10,"price":145},{"up_to_desi":30,"price":220}],"overflow_base_desi":30,"overflow_base_price":220,"extra_per_desi":21.5,"pod_fee":0}}'::jsonb
  ),
  (
    'hepsijet',
    'hepsiJET',
    TRUE,
    FALSE,
    TRUE,
    '{"quote":{"estimated_days":"1-2","tiers":[{"up_to_desi":3,"price":132},{"up_to_desi":10,"price":151},{"up_to_desi":30,"price":246}],"overflow_base_desi":30,"overflow_base_price":246,"extra_per_desi":23.34,"pod_fee":10}}'::jsonb
  ),
  (
    'surat',
    'Sürat Kargo',
    TRUE,
    FALSE,
    TRUE,
    '{"quote":{"estimated_days":"1-2","tiers":[{"up_to_desi":3,"price":140},{"up_to_desi":10,"price":155},{"up_to_desi":30,"price":242}],"overflow_base_desi":30,"overflow_base_price":242,"extra_per_desi":24,"pod_fee":13}}'::jsonb
  ),
  (
    'kolaygelsin',
    'Kolay Gelsin',
    TRUE,
    FALSE,
    FALSE,
    '{"quote":{"estimated_days":"1-3","tiers":[{"up_to_desi":3,"price":132},{"up_to_desi":10,"price":151},{"up_to_desi":30,"price":235}],"overflow_base_desi":30,"overflow_base_price":235,"extra_per_desi":23.34,"pod_fee":0}}'::jsonb
  )
ON CONFLICT (code) DO UPDATE
SET
  config = EXCLUDED.config,
  title = EXCLUDED.title,
  supports_pod = EXCLUDED.supports_pod;

INSERT INTO pricing_plans (code, title, description, is_public, rules)
VALUES
  (
    'standart',
    'Standart Liste',
    'Varsayılan fiyat listesi',
    TRUE,
    '{"carriers":{"yurtici":{"pod_fee":12},"aras":{"pod_fee":14},"mng":{"pod_fee":11},"ptt":{"pod_fee":0},"hepsijet":{"pod_fee":10},"surat":{"pod_fee":13},"kolaygelsin":{"pod_fee":0}}}'::jsonb
  ),
  (
    'kurumsal',
    'Kurumsal Liste',
    'Yüksek hacim indirimleri',
    TRUE,
    '{"carriers":{"yurtici":{"pod_fee":8},"aras":{"pod_fee":10},"mng":{"pod_fee":8},"hepsijet":{"pod_fee":8},"surat":{"pod_fee":9}}}'::jsonb
  )
ON CONFLICT (code) DO UPDATE
SET rules = EXCLUDED.rules;

-- Demo kullanıcı: demo@kargomkapinda.local / Demo123!
INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, status)
VALUES (
  'demo@kargomkapinda.local',
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
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@kargomkapinda.local'
ON CONFLICT (account_id, user_id) DO NOTHING;

INSERT INTO account_settings (account_id)
SELECT id FROM accounts WHERE account_code = 'DEMO001'
ON CONFLICT (account_id) DO NOTHING;

INSERT INTO account_pricing_plans (account_id, pricing_plan_id)
SELECT a.id, p.id
FROM accounts a, pricing_plans p
WHERE a.account_code = 'DEMO001' AND p.code = 'standart'
ON CONFLICT DO NOTHING;

INSERT INTO addresses (account_id, label, contact_name, phone, city, district, address_line, is_default)
SELECT a.id, 'Merkez Depo', 'Demo Lojistik A.Ş.', '+905551234567', 'İstanbul', 'Kadıköy', 'Caferağa Mah. Demo Sk. No:1', TRUE
FROM accounts a
WHERE a.account_code = 'DEMO001'
  AND NOT EXISTS (
    SELECT 1 FROM addresses ad WHERE ad.account_id = a.id AND ad.label = 'Merkez Depo'
  );

INSERT INTO addresses (account_id, label, contact_name, phone, city, district, address_line, is_default)
SELECT a.id, 'Şube Cizre', 'Demo Şube', '+905559876543', 'Şırnak', 'Cizre', 'Merkez Mah. Lojistik Cad. No:5', FALSE
FROM accounts a
WHERE a.account_code = 'DEMO001'
  AND NOT EXISTS (
    SELECT 1 FROM addresses ad WHERE ad.account_id = a.id AND ad.label = 'Şube Cizre'
  );

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
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@kargomkapinda.local'
ON CONFLICT (account_id, tracking_number) DO NOTHING;

UPDATE cargos c
SET
  sender_name = 'Demo Lojistik A.Ş.',
  sender_company = 'Demo Lojistik',
  receiver_city = (ARRAY['İstanbul', 'Ankara', 'Kayseri', 'İzmir', 'Bursa'])[1 + (substring(c.tracking_number from '.{2}$'))::int % 5],
  receiver_district = 'Merkez',
  carrier_barcode = 'ADO' || substr(c.tracking_number, 5, 12),
  reference_barcode = substr(c.tracking_number, 5, 12),
  last_movement = (ARRAY['Transferde', 'Dağıtımda', 'Teslimat Şubesi', 'Teslim Edildi', 'Çıkış Şubesi'])[1 + (random() * 4)::int],
  last_movement_description = 'Operasyon kaydı',
  payment_status = CASE WHEN c.pay_on_delivery THEN 'Tahsil Edilecek' ELSE NULL END,
  payment_type = CASE WHEN c.pay_on_delivery THEN 'Nakit' ELSE NULL END,
  desi = coalesce(c.desi, 3.0)
FROM accounts a
WHERE c.account_id = a.id AND a.account_code = 'DEMO001';

UPDATE accounts SET balance = 648.52 WHERE account_code = 'DEMO001';

INSERT INTO products (account_id, sku, title, unit_price, width_cm, height_cm, length_cm, desi, stock_quantity)
SELECT a.id, 'SKU-' || g, 'Ürün ' || g, 99.90 + g, 10 + g, 12 + g, 15 + g, 3, 100 - g
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
WHERE a.account_code = 'DEMO001' AND u.email = 'demo@kargomkapinda.local';
