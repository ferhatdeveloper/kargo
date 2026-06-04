-- PostgREST / API için görünümler (frontend alan adları)

CREATE OR REPLACE VIEW v_users_me AS
SELECT
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.phone,
  u.avatar_url AS avatar,
  CASE u.user_type
    WHEN 'customer' THEN 1
    WHEN 'staff' THEN 2
    WHEN 'admin' THEN 3
  END AS type,
  CASE u.status
    WHEN 'active' THEN 1
    WHEN 'inactive' THEN 0
    WHEN 'suspended' THEN 2
  END AS status
FROM users u;

CREATE OR REPLACE VIEW v_accounts AS
SELECT
  a.id,
  a.name,
  a.logo_url AS logo,
  a.eft_code,
  a.account_code,
  CASE a.status
    WHEN 'active' THEN 1
    WHEN 'inactive' THEN 0
    WHEN 'suspended' THEN 2
    WHEN 'closed' THEN 3
  END AS status,
  a.can_domestic,
  a.can_abroad,
  a.can_invoice,
  a.can_pod,
  a.has_sub_accounts
FROM accounts a;

CREATE OR REPLACE VIEW v_cargos AS
SELECT
  c.id,
  c.account_id,
  c.tracking_number,
  c.receiver_name,
  c.status_code AS status,
  c.pay_on_delivery,
  c.created_at,
  jsonb_build_object('title', cc.title) AS cargo_company
FROM cargos c
LEFT JOIN cargo_companies cc ON cc.id = c.cargo_company_id;

COMMENT ON VIEW v_cargos IS 'Portal Cargo tipi ile uyumlu JSON cargo_company nesnesi';

-- İstatistik özeti (dashboard)
CREATE OR REPLACE VIEW v_account_cargo_stats AS
SELECT
  account_id,
  count(*) FILTER (WHERE status NOT IN ('cancelled', 'draft')) AS total_cargos,
  count(*) FILTER (WHERE status = 'delivered') AS delivered_count,
  count(*) FILTER (WHERE pay_on_delivery) AS pod_count,
  count(*) FILTER (
    WHERE created_at >= date_trunc('month', now())
  ) AS month_count
FROM cargos
GROUP BY account_id;

GRANT SELECT ON v_users_me TO authenticated;
GRANT SELECT ON v_accounts TO authenticated;
GRANT SELECT ON v_cargos TO authenticated;
GRANT SELECT ON v_account_cargo_stats TO authenticated;
