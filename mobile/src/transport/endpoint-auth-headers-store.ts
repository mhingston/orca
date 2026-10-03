import { z } from 'zod'
import {
  cacheEndpointAuthSnapshot,
  normalizeEndpointAuthHeaders,
  type EndpointAuthHeaders
} from './endpoint-auth-headers'
import { markHostCredentialWrite } from './host-credential-write-revision'
import {
  deletePairingKeychainItem,
  readPairingKeychainItem,
  writePairingKeychainItem
} from './pairing-keychain'

// Why: SecureStore keys must match [A-Za-z0-9._-] (colons rejected), so use dots as the separator.
const HEADERS_KEY_PREFIX = 'orca.mobile-endpoint-auth.'

const EndpointAuthBundleSchema = z
  .object({
    v: z.literal(1),
    hostId: z.string().min(1),
    headers: z.record(z.string(), z.string())
  })
  .strict()

function headersKey(hostId: string): string {
  return `${HEADERS_KEY_PREFIX}${hostId}`
}

function parseStoredBundle(hostId: string, raw: string): EndpointAuthHeaders | null {
  try {
    const result = EndpointAuthBundleSchema.safeParse(JSON.parse(raw))
    if (!result.success || result.data.hostId !== hostId) {
      return null
    }
    const normalized = normalizeEndpointAuthHeaders(
      Object.entries(result.data.headers).map(([name, value]) => ({ name, value }))
    )
    return normalized.ok ? normalized.headers : null
  } catch {
    return null
  }
}

export async function readEndpointAuthHeaders(hostId: string): Promise<EndpointAuthHeaders | null> {
  const raw = await readPairingKeychainItem(headersKey(hostId))
  return raw === null ? null : parseStoredBundle(hostId, raw)
}

export async function writeEndpointAuthHeaders(
  hostId: string,
  headers: EndpointAuthHeaders
): Promise<void> {
  const validated = EndpointAuthBundleSchema.parse({ v: 1, hostId, headers })
  markHostCredentialWrite(validated.hostId)
  await writePairingKeychainItem(headersKey(validated.hostId), JSON.stringify(validated))
  cacheEndpointAuthSnapshot(validated.hostId, validated.headers)
}

export async function deleteEndpointAuthHeaders(hostId: string): Promise<void> {
  await deletePairingKeychainItem(headersKey(hostId))
  cacheEndpointAuthSnapshot(hostId, null)
}

/** Load headers into memory before opening a client; failures fall back to no headers. */
export async function primeEndpointAuthHeaders(
  hostId: string
): Promise<EndpointAuthHeaders | null> {
  try {
    const headers = await readEndpointAuthHeaders(hostId)
    cacheEndpointAuthSnapshot(hostId, headers)
    return headers
  } catch {
    cacheEndpointAuthSnapshot(hostId, null)
    return null
  }
}
