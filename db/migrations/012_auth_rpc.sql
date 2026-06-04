-- JWT (HS256) ve auth RPC — PostgREST: POST /rpc/auth_login

CREATE OR REPLACE FUNCTION base64url_encode(data bytea)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(replace(encode(data, 'base64'), E'\n', ''), E'\r', ''),
      '+', '-'
    ),
    '/', '_'
  );
$$;

CREATE OR REPLACE FUNCTION sign_jwt(claims jsonb, secret text, exp_seconds int DEFAULT 86400)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  header_text text := '{"alg":"HS256","typ":"JWT"}';
  payload jsonb;
  payload_text text;
  header_b64 text;
  payload_b64 text;
  signing_input text;
  signature bytea;
  sig_b64 text;
BEGIN
  payload := claims || jsonb_build_object(
    'exp', extract(epoch from now())::bigint + exp_seconds,
    'iat', extract(epoch from now())::bigint
  );
  payload_text := regexp_replace(payload::text, '\s', '', 'g');
  header_b64 := rtrim(base64url_encode(convert_to(header_text, 'utf8')), '=');
  payload_b64 := rtrim(base64url_encode(convert_to(payload_text, 'utf8')), '=');
  signing_input := header_b64 || '.' || payload_b64;
  signature := hmac(signing_input, secret, 'sha256');
  sig_b64 := rtrim(base64url_encode(signature), '=');
  RETURN signing_input || '.' || sig_b64;
END;
$$;

CREATE OR REPLACE FUNCTION jwt_secret()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    nullif(current_setting('app.jwt_secret', true), ''),
    'kargo-dev-jwt-secret-min-32-chars!!'
  );
$$;

-- Oturum aç (portal LoginResponse uyumlu)
CREATE OR REPLACE FUNCTION auth_login(
  p_email text,
  p_password text,
  p_remember boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user users%ROWTYPE;
  v_token text;
  v_session_id uuid;
  v_exp interval := CASE WHEN p_remember THEN interval '30 days' ELSE interval '24 hours' END;
BEGIN
  SELECT * INTO v_user
  FROM users
  WHERE email = lower(trim(p_email))
    AND status = 'active';

  IF v_user.id IS NULL OR v_user.password_hash <> crypt(p_password, v_user.password_hash) THEN
    RAISE EXCEPTION 'Geçersiz kullanıcı adı veya şifre'
      USING ERRCODE = 'P0001';
  END IF;

  v_session_id := gen_random_uuid();
  INSERT INTO user_sessions (id, user_id, token_hash, remember_me, expires_at)
  VALUES (
    v_session_id,
    v_user.id,
    encode(digest(v_session_id::text, 'sha256'), 'hex'),
    p_remember,
    now() + v_exp
  );

  UPDATE users SET last_login_at = now() WHERE id = v_user.id;

  v_token := sign_jwt(
    jsonb_build_object(
      'role', 'authenticated',
      'sub', v_user.id::text
    ),
    jwt_secret(),
    CASE WHEN p_remember THEN 2592000 ELSE 86400 END
  );

  RETURN jsonb_build_object(
    'token', v_token,
    'user', jsonb_build_object(
      'id', v_user.id,
      'first_name', v_user.first_name,
      'last_name', v_user.last_name,
      'email', v_user.email,
      'phone', v_user.phone,
      'avatar', v_user.avatar_url,
      'type', CASE v_user.user_type WHEN 'customer' THEN 1 WHEN 'staff' THEN 2 ELSE 3 END,
      'status', CASE v_user.status WHEN 'active' THEN 1 WHEN 'inactive' THEN 0 ELSE 2 END
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth_me()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth_user_id();
  v_user users%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  SELECT * INTO v_user FROM users WHERE id = v_uid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501';
  END IF;
  RETURN jsonb_build_object(
    'id', v_user.id,
    'first_name', v_user.first_name,
    'last_name', v_user.last_name,
    'email', v_user.email,
    'phone', v_user.phone,
    'avatar', v_user.avatar_url,
    'type', CASE v_user.user_type WHEN 'customer' THEN 1 WHEN 'staff' THEN 2 ELSE 3 END,
    'status', CASE v_user.status WHEN 'active' THEN 1 WHEN 'inactive' THEN 0 ELSE 2 END
  );
END;
$$;

CREATE OR REPLACE FUNCTION auth_logout()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_sessions
  SET revoked_at = now()
  WHERE user_id = auth_user_id()
    AND revoked_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION auth_forgot_password(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_raw text := encode(gen_random_bytes(32), 'hex');
BEGIN
  SELECT id INTO v_user_id FROM users WHERE email = lower(trim(p_email));
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;
  INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
  VALUES (v_user_id, encode(digest(v_raw, 'sha256'), 'hex'), now() + interval '1 hour');
END;
$$;

-- Kullanıcı hesapları (portal: POST /users/:id/accounts/query)
CREATE OR REPLACE FUNCTION user_accounts_query(
  p_user_id uuid,
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 50
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth_user_id();
  v_offset int;
  v_total bigint;
  v_items jsonb;
BEGIN
  IF v_uid IS NULL OR (v_uid <> p_user_id AND current_setting('request.jwt.claim.role', true) <> 'service_role') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_offset := greatest(0, (p_page - 1) * p_per_page);

  SELECT count(*) INTO v_total
  FROM account_members am
  JOIN accounts a ON a.id = am.account_id
  WHERE am.user_id = p_user_id;

  SELECT coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      a.id,
      a.name,
      a.logo_url AS logo,
      a.eft_code,
      a.account_code,
      CASE a.status WHEN 'active' THEN 1 WHEN 'inactive' THEN 0 WHEN 'suspended' THEN 2 ELSE 3 END AS status,
      a.can_domestic,
      a.can_abroad,
      a.can_invoice,
      a.can_pod,
      a.has_sub_accounts
    FROM account_members am
    JOIN accounts a ON a.id = am.account_id
    WHERE am.user_id = p_user_id
    ORDER BY a.name
    LIMIT p_per_page OFFSET v_offset
  ) x;

  RETURN jsonb_build_object('items', v_items, 'total', v_total);
END;
$$;

-- Kargo sorgusu (portal: POST /accounts/:id/cargos/query)
CREATE OR REPLACE FUNCTION account_cargos_query(
  p_account_id uuid,
  p_page int DEFAULT 1,
  p_per_page int DEFAULT 25
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
BEGIN
  IF NOT auth_has_account(p_account_id) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  v_offset := greatest(0, (p_page - 1) * p_per_page);

  SELECT count(*) INTO v_total FROM cargos WHERE account_id = p_account_id;

  SELECT coalesce(jsonb_agg(row_to_json(x)::jsonb), '[]'::jsonb) INTO v_items
  FROM (
    SELECT
      c.id,
      c.tracking_number,
      c.receiver_name,
      c.status_code AS status,
      c.pay_on_delivery,
      c.created_at,
      jsonb_build_object('title', cc.title) AS cargo_company
    FROM cargos c
    LEFT JOIN cargo_companies cc ON cc.id = c.cargo_company_id
    WHERE c.account_id = p_account_id
    ORDER BY c.created_at DESC
    LIMIT p_per_page OFFSET v_offset
  ) x;

  RETURN jsonb_build_object('items', v_items, 'total', v_total);
END;
$$;

-- PostgREST yetkileri
GRANT EXECUTE ON FUNCTION auth_login(text, text, boolean) TO anon, authenticator;
GRANT EXECUTE ON FUNCTION auth_forgot_password(text) TO anon, authenticator;
GRANT EXECUTE ON FUNCTION auth_me() TO authenticated;
GRANT EXECUTE ON FUNCTION auth_logout() TO authenticated;
GRANT EXECUTE ON FUNCTION user_accounts_query(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION account_cargos_query(uuid, int, int) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

ALTER DATABASE kargo SET app.jwt_secret TO 'kargo-dev-jwt-secret-min-32-chars!!';
