#!/usr/bin/env node
/**
 * PostgREST smoke test — docker compose up -d sonrası çalıştırın.
 * exit 0 = başarılı
 */
const BASE = process.env.POSTGREST_URL || 'http://127.0.0.1:3000'
const EMAIL = process.env.DEMO_EMAIL || 'demo@stocado.local'
const PASS = process.env.DEMO_PASSWORD || 'Demo123!'

async function post(path, body, token) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  })
  const text = await res.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = text
  }
  if (!res.ok) {
    throw new Error(`${path} ${res.status}: ${JSON.stringify(data)}`)
  }
  return data
}

async function main() {
  console.log('PostgREST smoke:', BASE)
  const login = await post('/rpc/auth_login', {
    p_email: EMAIL,
    p_password: PASS,
    p_remember: false,
  })
  if (!login.token || !login.user?.id) throw new Error('login missing token/user')
  console.log('  auth_login OK', login.user.email)

  const me = await post('/rpc/auth_me', {}, login.token)
  if (me.id !== login.user.id) throw new Error('auth_me id mismatch')
  console.log('  auth_me OK')

  const accounts = await post(
    '/rpc/user_accounts_query',
    { p_user_id: login.user.id, p_page: 1, p_per_page: 10 },
    login.token,
  )
  if (!accounts.items?.length) throw new Error('no accounts')
  const accountId = accounts.items[0].id
  console.log('  user_accounts_query OK', accounts.items.length, 'account(s)')

  const cargos = await post(
    '/rpc/account_cargos_query',
    { p_account_id: accountId, p_page: 1, p_per_page: 5 },
    login.token,
  )
  if (typeof cargos.total !== 'number') throw new Error('cargos missing total')
  console.log('  account_cargos_query OK total=', cargos.total)

  console.log('All smoke checks passed.')
}

main().catch((e) => {
  console.error('SMOKE FAILED:', e.message)
  process.exit(1)
})
