-- Stocado portal paritesi: ek kargo alanları ve genişletilmiş RPC

ALTER TABLE cargos
  ADD COLUMN IF NOT EXISTS sender_name TEXT,
  ADD COLUMN IF NOT EXISTS sender_company TEXT,
  ADD COLUMN IF NOT EXISTS receiver_city TEXT,
  ADD COLUMN IF NOT EXISTS receiver_district TEXT,
  ADD COLUMN IF NOT EXISTS carrier_barcode TEXT,
  ADD COLUMN IF NOT EXISTS reference_barcode TEXT,
  ADD COLUMN IF NOT EXISTS last_movement TEXT,
  ADD COLUMN IF NOT EXISTS last_movement_description TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT,
  ADD COLUMN IF NOT EXISTS payment_type TEXT,
  ADD COLUMN IF NOT EXISTS label_printed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pod_settlement_estimate DATE;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS width_cm INT,
  ADD COLUMN IF NOT EXISTS height_cm INT,
  ADD COLUMN IF NOT EXISTS length_cm INT;

CREATE OR REPLACE FUNCTION account_finance_summary(p_account_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_pod_receivable numeric;
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT a.balance INTO v_balance FROM accounts a WHERE a.id = p_account_id;

  SELECT coalesce(sum(c.pod_amount), 0) INTO v_pod_receivable
  FROM cargos c
  WHERE c.account_id = p_account_id
    AND c.pay_on_delivery
    AND coalesce(c.payment_status, 'Tahsil Edilecek') IN ('Tahsil Edilecek', 'Belli Değil');

  RETURN jsonb_build_object(
    'balance', coalesce(v_balance, 0),
    'pod_receivable', coalesce(v_pod_receivable, 0),
    'currency', 'TRY'
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_dashboard_metrics(
  p_account_id uuid,
  p_days int DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_since timestamptz := now() - make_interval(days => greatest(1, p_days));
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN (
    SELECT jsonb_build_object(
      'pending', count(*) FILTER (
        WHERE status IN ('draft', 'active') AND coalesce(last_movement, '') IN ('', 'Gönderime Hazır', 'Entegrasyon Hatası')
      ),
      'in_transit', count(*) FILTER (
        WHERE status = 'in_transit'
          OR last_movement IN ('Çıkış Şubesi', 'Transferde', 'Teslimat Şubesi', 'Dağıtımda')
      ),
      'delivered', count(*) FILTER (WHERE status = 'delivered'),
      'problem', count(*) FILTER (
        WHERE status IN ('cancelled', 'returned') OR last_movement = 'Entegrasyon Hatası'
      ),
      'returned', count(*) FILTER (WHERE status = 'returned'),
      'total', count(*) FILTER (WHERE status <> 'draft'),
      'pod_open', count(*) FILTER (WHERE pay_on_delivery AND payment_status = 'Tahsil Edilecek'),
      'daily', coalesce((
        SELECT jsonb_agg(jsonb_build_object('date', d.day, 'total', d.cnt, 'delivered', d.del) ORDER BY d.day)
        FROM (
          SELECT date_trunc('day', created_at)::date AS day,
            count(*) AS cnt,
            count(*) FILTER (WHERE status = 'delivered') AS del
          FROM cargos
          WHERE account_id = p_account_id
            AND created_at >= v_since
            AND status <> 'draft'
          GROUP BY 1
        ) d
      ), '[]'::jsonb),
      'by_carrier', coalesce((
        SELECT jsonb_agg(jsonb_build_object('title', x.title, 'count', x.cnt) ORDER BY x.cnt DESC)
        FROM (
          SELECT cc.title, count(*) AS cnt
          FROM cargos c
          LEFT JOIN cargo_companies cc ON cc.id = c.cargo_company_id
          WHERE c.account_id = p_account_id AND c.status <> 'draft'
          GROUP BY cc.title
        ) x
      ), '[]'::jsonb)
    )
    FROM cargos
    WHERE account_id = p_account_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_cargos_query(
  p_account_id uuid,
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 10,
  p_tab text DEFAULT 'all',
  p_search text DEFAULT NULL,
  p_filters jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset int;
  v_total bigint;
  v_items jsonb;
  v_search text := nullif(trim(p_search), '');
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_offset := greatest(0, (p_page - 1) * p_per_page);

  SELECT count(*) INTO v_total
  FROM cargos c
  WHERE c.account_id = p_account_id
    AND (
      (p_tab = 'draft' AND c.status = 'draft')
      OR (p_tab = 'pod' AND c.pay_on_delivery AND c.status <> 'draft')
      OR (p_tab = 'all' AND c.status <> 'draft')
      OR (p_tab NOT IN ('all', 'pod', 'draft'))
    )
    AND (
      v_search IS NULL
      OR c.receiver_name ILIKE '%' || v_search || '%'
      OR c.tracking_number ILIKE '%' || v_search || '%'
      OR c.carrier_barcode ILIKE '%' || v_search || '%'
      OR c.reference_barcode ILIKE '%' || v_search || '%'
      OR c.external_order_id ILIKE '%' || v_search || '%'
    )
    AND (
      NOT (p_filters ? 'pay_on_delivery')
      OR c.pay_on_delivery = (p_filters ->> 'pay_on_delivery')::boolean
    )
    AND (
      NOT (p_filters ? 'payment_status')
      OR c.payment_status = (p_filters ->> 'payment_status')
    )
    AND (
      NOT (p_filters ? 'label_printed')
      OR c.label_printed = (p_filters ->> 'label_printed')::boolean
    )
    AND (
      NOT (p_filters ? 'last_movements')
      OR c.last_movement = ANY (
        SELECT jsonb_array_elements_text(p_filters -> 'last_movements')
      )
    )
    AND (
      NOT (p_filters ? 'created_from')
      OR c.created_at >= (p_filters ->> 'created_from')::timestamptz
    )
    AND (
      NOT (p_filters ? 'created_to')
      OR c.created_at <= (p_filters ->> 'created_to')::timestamptz
    )
    AND (
      NOT (p_filters ? 'desi_min')
      OR c.desi >= (p_filters ->> 'desi_min')::numeric
    )
    AND (
      NOT (p_filters ? 'desi_max')
      OR c.desi <= (p_filters ->> 'desi_max')::numeric
    );

  SELECT coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      c.id,
      c.tracking_number,
      c.receiver_name,
      c.receiver_phone,
      c.receiver_city,
      c.receiver_district,
      c.sender_name,
      c.sender_company,
      c.status_code AS status,
      c.status::text AS status_key,
      c.pay_on_delivery,
      c.pod_amount,
      c.payment_status,
      c.payment_type,
      c.pod_settlement_estimate,
      c.created_at,
      c.desi,
      c.carrier_barcode,
      c.reference_barcode,
      c.last_movement,
      c.last_movement_description,
      c.external_order_id AS order_number,
      c.label_printed,
      jsonb_build_object(
        'title', cc.title,
        'code', cc.code,
        'logo_url', cc.logo_url
      ) AS cargo_company
    FROM cargos c
    LEFT JOIN cargo_companies cc ON cc.id = c.cargo_company_id
    WHERE c.account_id = p_account_id
      AND (
        (p_tab = 'draft' AND c.status = 'draft')
        OR (p_tab = 'pod' AND c.pay_on_delivery AND c.status <> 'draft')
        OR (p_tab = 'all' AND c.status <> 'draft')
        OR (p_tab NOT IN ('all', 'pod', 'draft'))
      )
      AND (
        v_search IS NULL
        OR c.receiver_name ILIKE '%' || v_search || '%'
        OR c.tracking_number ILIKE '%' || v_search || '%'
        OR c.carrier_barcode ILIKE '%' || v_search || '%'
        OR c.reference_barcode ILIKE '%' || v_search || '%'
        OR c.external_order_id ILIKE '%' || v_search || '%'
      )
      AND (
        NOT (p_filters ? 'pay_on_delivery')
        OR c.pay_on_delivery = (p_filters ->> 'pay_on_delivery')::boolean
      )
      AND (
        NOT (p_filters ? 'payment_status')
        OR c.payment_status = (p_filters ->> 'payment_status')
      )
      AND (
        NOT (p_filters ? 'label_printed')
        OR c.label_printed = (p_filters ->> 'label_printed')::boolean
      )
      AND (
        NOT (p_filters ? 'last_movements')
        OR c.last_movement = ANY (
          SELECT jsonb_array_elements_text(p_filters -> 'last_movements')
        )
      )
      AND (
        NOT (p_filters ? 'created_from')
        OR c.created_at >= (p_filters ->> 'created_from')::timestamptz
      )
      AND (
        NOT (p_filters ? 'created_to')
        OR c.created_at <= (p_filters ->> 'created_to')::timestamptz
      )
      AND (
        NOT (p_filters ? 'desi_min')
        OR c.desi >= (p_filters ->> 'desi_min')::numeric
      )
      AND (
        NOT (p_filters ? 'desi_max')
        OR c.desi <= (p_filters ->> 'desi_max')::numeric
      )
    ORDER BY c.created_at DESC
    LIMIT p_per_page OFFSET v_offset
  ) x;

  RETURN jsonb_build_object('items', v_items, 'total', v_total);
END;
$$;

CREATE OR REPLACE FUNCTION account_products_query(
  p_account_id uuid,
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 25,
  p_search text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offset int;
  v_total bigint;
  v_items jsonb;
  v_search text := nullif(trim(p_search), '');
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_offset := greatest(0, (p_page - 1) * p_per_page);

  SELECT count(*) INTO v_total
  FROM products p
  WHERE p.account_id = p_account_id
    AND (
      v_search IS NULL
      OR p.title ILIKE '%' || v_search || '%'
      OR p.sku ILIKE '%' || v_search || '%'
    );

  SELECT coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      p.id,
      p.sku,
      p.title,
      p.unit_price,
      p.width_cm,
      p.height_cm,
      p.length_cm,
      p.desi,
      p.is_active,
      p.created_at
    FROM products p
    WHERE p.account_id = p_account_id
      AND (
        v_search IS NULL
        OR p.title ILIKE '%' || v_search || '%'
        OR p.sku ILIKE '%' || v_search || '%'
      )
    ORDER BY p.created_at DESC
    LIMIT p_per_page OFFSET v_offset
  ) x;

  RETURN jsonb_build_object('items', v_items, 'total', v_total);
END;
$$;

CREATE OR REPLACE FUNCTION account_integrations_query(p_account_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN coalesce(
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'provider_code', i.provider_code,
          'title', i.title,
          'status', i.status::text,
          'last_sync_at', i.last_sync_at
        )
        ORDER BY i.title
      )
      FROM integrations i
      WHERE i.account_id = p_account_id
    ),
    '[]'::jsonb
  );
END;
$$;

-- account_cargo_create: yeni kolonları doldur
CREATE OR REPLACE FUNCTION account_cargo_create(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id uuid := (p_payload ->> 'account_id')::uuid;
  v_carrier_id uuid := (p_payload ->> 'carrier_id')::uuid;
  v_uid uuid := auth_user_id();
  v_desi numeric;
  v_tracking text;
  v_ref text;
  v_cargo_id uuid;
  v_status cargo_status;
  v_price numeric;
  v_sender_name text;
  v_sender_company text;
BEGIN
  IF v_account_id IS NULL OR NOT auth_has_account(v_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_desi := coalesce(
    (p_payload ->> 'desi')::numeric,
    compute_chargeable_desi(
      (p_payload ->> 'length_cm')::numeric,
      (p_payload ->> 'width_cm')::numeric,
      (p_payload ->> 'height_cm')::numeric,
      (p_payload ->> 'weight_kg')::numeric
    )
  );

  v_status := CASE
    WHEN coalesce((p_payload ->> 'is_draft')::boolean, false) THEN 'draft'::cargo_status
    ELSE 'active'::cargo_status
  END;

  v_tracking := coalesce(
    nullif(trim(p_payload ->> 'tracking_number'), ''),
    'NV' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  );
  v_ref := substr(replace(v_tracking, 'NV', ''), 1, 12);

  IF v_carrier_id IS NULL THEN
    SELECT (q ->> 'carrier_id')::uuid INTO v_carrier_id
    FROM jsonb_array_elements(
      (account_cargo_quote(
        v_account_id,
        (p_payload ->> 'length_cm')::numeric,
        (p_payload ->> 'width_cm')::numeric,
        (p_payload ->> 'height_cm')::numeric,
        (p_payload ->> 'weight_kg')::numeric,
        v_desi,
        coalesce((p_payload ->> 'pay_on_delivery')::boolean, false),
        (p_payload ->> 'pod_amount')::numeric
      ) -> 'quotes')
    ) q
    WHERE (q ->> 'is_cheapest')::boolean = true
    LIMIT 1;
  END IF;

  v_sender_name := coalesce(p_payload -> 'sender' ->> 'contact_name', p_payload ->> 'sender_name');
  v_sender_company := coalesce(p_payload -> 'sender' ->> 'company', p_payload ->> 'sender_company');

  INSERT INTO cargos (
    account_id,
    cargo_company_id,
    created_by,
    tracking_number,
    carrier_barcode,
    reference_barcode,
    receiver_name,
    receiver_phone,
    receiver_email,
    receiver_city,
    receiver_district,
    sender_name,
    sender_company,
    status,
    pay_on_delivery,
    pod_amount,
    payment_status,
    payment_type,
    weight_kg,
    desi,
    package_count,
    content_description,
    sender_snapshot,
    receiver_snapshot,
    last_movement,
    last_movement_description,
    metadata
  )
  VALUES (
    v_account_id,
    v_carrier_id,
    v_uid,
    v_tracking,
    coalesce(p_payload ->> 'carrier_barcode', 'ADO' || v_ref),
    coalesce(p_payload ->> 'reference_barcode', v_ref),
    coalesce(p_payload ->> 'receiver_name', 'Alıcı'),
    p_payload ->> 'receiver_phone',
    p_payload ->> 'receiver_email',
    p_payload -> 'receiver' ->> 'city',
    p_payload -> 'receiver' ->> 'district',
    v_sender_name,
    v_sender_company,
    v_status,
    coalesce((p_payload ->> 'pay_on_delivery')::boolean, false),
    (p_payload ->> 'pod_amount')::numeric,
    CASE
      WHEN coalesce((p_payload ->> 'pay_on_delivery')::boolean, false) THEN 'Tahsil Edilecek'
      ELSE NULL
    END,
    CASE
      WHEN coalesce((p_payload ->> 'pay_on_delivery')::boolean, false) THEN 'Nakit'
      ELSE NULL
    END,
    (p_payload ->> 'weight_kg')::numeric,
    v_desi,
    coalesce((p_payload ->> 'package_count')::int, 1),
    p_payload ->> 'content_description',
    p_payload -> 'sender',
    p_payload -> 'receiver',
    CASE WHEN v_status = 'draft' THEN 'Gönderime Hazır' ELSE 'Çıkış Şubesi' END,
    CASE WHEN v_status = 'draft' THEN 'Taslak' ELSE 'Gönderi oluşturuldu' END,
    jsonb_build_object(
      'quoted_price', v_price,
      'label_settings', coalesce(p_payload -> 'label_settings', '{}'::jsonb)
    )
  )
  RETURNING id INTO v_cargo_id;

  INSERT INTO cargo_status_events (cargo_id, status, description, source)
  VALUES (
    v_cargo_id,
    v_status,
    CASE WHEN v_status = 'draft' THEN 'Taslak oluşturuldu' ELSE 'Gönderi oluşturuldu' END,
    'portal'
  );

  RETURN jsonb_build_object(
    'id', v_cargo_id,
    'tracking_number', v_tracking,
    'carrier_barcode', coalesce(p_payload ->> 'carrier_barcode', 'ADO' || v_ref),
    'reference_barcode', coalesce(p_payload ->> 'reference_barcode', v_ref),
    'status', CASE v_status WHEN 'draft' THEN 0 WHEN 'delivered' THEN 2 WHEN 'cancelled' THEN 3 ELSE 1 END,
    'desi', v_desi,
    'cargo_company_id', v_carrier_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION account_finance_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION account_dashboard_metrics(uuid, int) TO authenticated;
GRANT EXECUTE ON FUNCTION account_products_query(uuid, int, int, text) TO authenticated;
GRANT EXECUTE ON FUNCTION account_integrations_query(uuid) TO authenticated;
