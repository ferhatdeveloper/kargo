import { api } from './client'
import { isPostgrest } from './config'

function assertPostgrest() {
  if (!isPostgrest) {
    throw new Error(
      'Kargom Kapında yalnızca PostgREST API ile çalışır. portal/.env içinde VITE_API_BACKEND=postgrest olmalıdır.',
    )
  }
}

/** PostgREST RPC: POST /rpc/{procedure} */
export async function callRpc<T>(
  procedure: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  assertPostgrest()
  const res = await api.post<T>(`/rpc/${procedure}`, body)
  return res.data
}
