-- Kargo oluşturma, fiyat karşılaştırma, etiket ayarları

CREATE OR REPLACE FUNCTION compute_chargeable_desi(
  p_length_cm numeric DEFAULT 0,
  p_width_cm numeric DEFAULT 0,
  p_height_cm numeric DEFAULT 0,
  p_weight_kg numeric DEFAULT 0
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT greatest(
    coalesce(p_weight_kg, 0),
    round(
      (coalesce(p_length_cm, 0) * coalesce(p_width_cm, 0) * coalesce(p_height_cm, 0)) / 3000.0,
      2
    )
  );
$$;

CREATE OR REPLACE FUNCTION price_from_carrier_rules(p_desi numeric, p_rules jsonb)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_desi int;
  v_tier jsonb;
  v_price numeric;
  v_base_desi int;
  v_base_price numeric;
  v_extra numeric;
BEGIN
  IF p_rules IS NULL OR p_rules = 'null'::jsonb THEN
    RETURN NULL;
  END IF;

  v_desi := greatest(1, ceil(coalesce(p_desi, 1))::int);

  FOR v_tier IN
    SELECT value
    FROM jsonb_array_elements(coalesce(p_rules -> 'tiers', '[]'::jsonb)) AS value
    ORDER BY (value ->> 'up_to_desi')::int
  LOOP
    IF v_desi <= (v_tier ->> 'up_to_desi')::int THEN
      RETURN (v_tier ->> 'price')::numeric;
    END IF;
  END LOOP;

  v_base_desi := coalesce((p_rules ->> 'overflow_base_desi')::int, 30);
  v_base_price := coalesce((p_rules ->> 'overflow_base_price')::numeric, 235);
  v_extra := coalesce((p_rules ->> 'extra_per_desi')::numeric, 23.34);

  IF v_desi <= v_base_desi THEN
    RETURN v_base_price;
  END IF;

  RETURN v_base_price + (v_desi - v_base_desi) * v_extra;
END;
$$;

CREATE OR REPLACE FUNCTION account_carriers_query(p_account_id uuid)
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
          'id', cc.id,
          'code', cc.code,
          'title', cc.title,
          'logo_url', cc.logo_url,
          'supports_pod', cc.supports_pod
        )
        ORDER BY cc.title
      )
      FROM cargo_companies cc
      WHERE cc.is_active
    ),
    '[]'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_cargo_quote(
  p_account_id uuid,
  p_length_cm numeric DEFAULT 0,
  p_width_cm numeric DEFAULT 0,
  p_height_cm numeric DEFAULT 0,
  p_weight_kg numeric DEFAULT 0,
  p_desi numeric DEFAULT NULL,
  p_pay_on_delivery boolean DEFAULT false,
  p_pod_amount numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_desi numeric;
  v_rules jsonb;
  v_carrier_rules jsonb;
  v_quotes jsonb := '[]'::jsonb;
  v_row record;
  v_price numeric;
  v_pod_fee numeric;
  v_total numeric;
  v_cheapest numeric;
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_desi := coalesce(
    p_desi,
    compute_chargeable_desi(p_length_cm, p_width_cm, p_height_cm, p_weight_kg)
  );

  SELECT pp.rules INTO v_rules
  FROM account_pricing_plans app
  JOIN pricing_plans pp ON pp.id = app.pricing_plan_id
  WHERE app.account_id = p_account_id
    AND (app.expires_at IS NULL OR app.expires_at > now())
  ORDER BY app.assigned_at DESC
  LIMIT 1;

  IF v_rules IS NULL THEN
    SELECT rules INTO v_rules FROM pricing_plans WHERE code = 'standart' LIMIT 1;
  END IF;

  v_carrier_rules := coalesce(v_rules -> 'carriers', '{}'::jsonb);

  FOR v_row IN
    SELECT cc.id, cc.code, cc.title, cc.logo_url, cc.supports_pod, cc.config
    FROM cargo_companies cc
    WHERE cc.is_active
    ORDER BY cc.title
  LOOP
    v_price := price_from_carrier_rules(
      v_desi,
      coalesce(
        v_carrier_rules -> v_row.code,
        v_row.config -> 'quote',
        '{}'::jsonb
      )
    );

    IF v_price IS NULL THEN
      CONTINUE;
    END IF;

    v_pod_fee := 0;
    IF p_pay_on_delivery AND v_row.supports_pod THEN
      v_pod_fee := coalesce(
        (v_carrier_rules -> v_row.code ->> 'pod_fee')::numeric,
        (v_row.config -> 'quote' ->> 'pod_fee')::numeric,
        12
      );
    END IF;

    v_total := v_price + v_pod_fee;

    v_quotes := v_quotes || jsonb_build_array(
      jsonb_build_object(
        'carrier_id', v_row.id,
        'carrier_code', v_row.code,
        'title', v_row.title,
        'logo_url', v_row.logo_url,
        'chargeable_desi', v_desi,
        'price', round(v_price, 2),
        'pod_fee', round(v_pod_fee, 2),
        'total', round(v_total, 2),
        'currency', 'TRY',
        'estimated_days', coalesce(v_row.config -> 'quote' ->> 'estimated_days', '1-3'),
        'supports_pod', v_row.supports_pod
      )
    );
  END LOOP;

  SELECT min((q ->> 'total')::numeric) INTO v_cheapest
  FROM jsonb_array_elements(v_quotes) q;

  SELECT coalesce(
    jsonb_agg(
      q || jsonb_build_object(
        'is_cheapest', ((q ->> 'total')::numeric = v_cheapest)
      )
      ORDER BY (q ->> 'total')::numeric
    ),
    '[]'::jsonb
  )
  INTO v_quotes
  FROM jsonb_array_elements(v_quotes) q;

  RETURN jsonb_build_object(
    'chargeable_desi', v_desi,
    'pay_on_delivery', p_pay_on_delivery,
    'quotes', v_quotes
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_addresses_query(p_account_id uuid)
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
          'id', a.id,
          'label', a.label,
          'contact_name', a.contact_name,
          'phone', a.phone,
          'city', a.city,
          'district', a.district,
          'address_line', a.address_line,
          'is_default', a.is_default
        )
        ORDER BY a.is_default DESC, a.label
      )
      FROM addresses a
      WHERE a.account_id = p_account_id
    ),
    '[]'::jsonb
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_label_settings_get(p_account_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_settings jsonb;
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT settings INTO v_settings
  FROM account_settings
  WHERE account_id = p_account_id;

  RETURN coalesce(
    v_settings -> 'label',
    jsonb_build_object(
      'format', '100x150',
      'layout', 'standard',
      'show_logo', true,
      'show_barcode', true,
      'show_reference', true,
      'font_size', 'md',
      'accent_color', '#228be6'
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION account_label_settings_save(
  p_account_id uuid,
  p_label jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  INSERT INTO account_settings (account_id, settings)
  VALUES (p_account_id, jsonb_build_object('label', p_label))
  ON CONFLICT (account_id) DO UPDATE
  SET settings = account_settings.settings || jsonb_build_object('label', p_label),
      updated_at = now();

  RETURN account_label_settings_get(p_account_id);
END;
$$;

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
  v_cargo_id uuid;
  v_status cargo_status;
  v_quote jsonb;
  v_price numeric;
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

  SELECT (q ->> 'total')::numeric INTO v_price
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
  WHERE (q ->> 'carrier_id')::uuid = v_carrier_id
  LIMIT 1;

  INSERT INTO cargos (
    account_id,
    cargo_company_id,
    created_by,
    tracking_number,
    receiver_name,
    receiver_phone,
    receiver_email,
    status,
    pay_on_delivery,
    pod_amount,
    weight_kg,
    desi,
    package_count,
    content_description,
    sender_snapshot,
    receiver_snapshot,
    metadata
  )
  VALUES (
    v_account_id,
    v_carrier_id,
    v_uid,
    v_tracking,
    coalesce(p_payload ->> 'receiver_name', 'Alıcı'),
    p_payload ->> 'receiver_phone',
    p_payload ->> 'receiver_email',
    v_status,
    coalesce((p_payload ->> 'pay_on_delivery')::boolean, false),
    (p_payload ->> 'pod_amount')::numeric,
    (p_payload ->> 'weight_kg')::numeric,
    v_desi,
    coalesce((p_payload ->> 'package_count')::int, 1),
    p_payload ->> 'content_description',
    p_payload -> 'sender',
    p_payload -> 'receiver',
    jsonb_build_object(
      'quoted_price', v_price,
      'label_settings', coalesce(p_payload -> 'label_settings', '{}'::jsonb),
      'dimensions', jsonb_build_object(
        'length_cm', p_payload ->> 'length_cm',
        'width_cm', p_payload ->> 'width_cm',
        'height_cm', p_payload ->> 'height_cm'
      )
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
    'status', CASE v_status WHEN 'draft' THEN 0 WHEN 'delivered' THEN 2 WHEN 'cancelled' THEN 3 ELSE 1 END,
    'desi', v_desi,
    'quoted_price', v_price,
    'cargo_company_id', v_carrier_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION compute_chargeable_desi(numeric, numeric, numeric, numeric) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION account_carriers_query(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION account_cargo_quote(uuid, numeric, numeric, numeric, numeric, numeric, boolean, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION account_addresses_query(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION account_label_settings_get(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION account_label_settings_save(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION account_cargo_create(jsonb) TO authenticated;
