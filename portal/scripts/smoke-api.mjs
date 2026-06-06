#!/usr/bin/env node
/**
 * PostgREST smoke test — docker compose up -d sonrası çalıştırın.
 * exit 0 = başarılı
 */
const BASE = process.env.POSTGREST_URL || 'http://127.0.0.1:3000'
const PASS = process.env.DEMO_PASSWORD || 'Demo123!'
const EMAIL_CANDIDATES = [
  process.env.DEMO_EMAIL,
  'demo@navlun.local',
  'demo@stocado.local',
].filter(Boolean)

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

async function loginWithDemoUser() {
  let lastError
  for (const email of EMAIL_CANDIDATES) {
    try {
      const login = await post('/rpc/auth_login', {
        p_email: email,
        p_password: PASS,
        p_remember: false,
      })
      if (login.token && login.user?.id) {
        return { login, email }
      }
    } catch (e) {
      lastError = e
    }
  }
  throw lastError ?? new Error('No demo user could log in')
}

async function main() {
  console.log('PostgREST smoke:', BASE)
  const { login, email } = await loginWithDemoUser()
  console.log('  auth_login OK', login.user.email, `(tried: ${email})`)

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

  const quote = await post(
    '/rpc/account_cargo_quote',
    {
      p_account_id: accountId,
      p_length_cm: 30,
      p_width_cm: 20,
      p_height_cm: 15,
      p_weight_kg: 2,
      p_desi: null,
      p_pay_on_delivery: false,
      p_pod_amount: null,
    },
    login.token,
  )
  if (!quote.quotes?.length) throw new Error('cargo_quote empty')
  console.log('  account_cargo_quote OK', quote.quotes.length, 'carrier(s)')

  const addresses = await post(
    '/rpc/account_addresses_query',
    { p_account_id: accountId },
    login.token,
  )
  if (!Array.isArray(addresses)) throw new Error('addresses not array')
  console.log('  account_addresses_query OK', addresses.length, 'address(es)')

  console.log('All smoke checks passed.')
}

main().catch((e) => {
  console.error('SMOKE FAILED:', e.message)
  process.exit(1)
})
