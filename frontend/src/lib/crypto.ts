/**
 * Mivloc client-side encryption.
 * Each chat has a random AES-GCM-256 key; messages are stored ONLY as
 * base64(iv || ciphertext). Each user additionally sets a personal unlock
 * code per chat: PBKDF2 turns it into a verification key so the app can
 * check the code before using the chat key. Codes never leave the device.
 */

const enc = new TextEncoder()
const dec = new TextDecoder()

export const CODE_CHECK_PLAINTEXT = 'MIVLOC_OK'

function b64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let s = ''
  bytes.forEach((b) => (s += String.fromCharCode(b)))
  return btoa(s)
}

function fromB64(s: string) {
  const bin = atob(s)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export function genSalt(): string {
  return b64(crypto.getRandomValues(new Uint8Array(16)))
}

export async function deriveKey(code: string, saltB64: string): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', enc.encode(code), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: fromB64(saltB64), iterations: 100_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function encryptText(key: CryptoKey, text: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text))
  const out = new Uint8Array(iv.length + ct.byteLength)
  out.set(iv, 0)
  out.set(new Uint8Array(ct), iv.length)
  return b64(out)
}

export async function decryptText(key: CryptoKey, payloadB64: string): Promise<string> {
  const payload = fromB64(payloadB64)
  const iv = payload.slice(0, 12)
  const ct = payload.slice(12)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return dec.decode(pt)
}

/** Verify a chat code against the stored code_check blob (throws if wrong). */
export async function verifyCode(code: string, saltB64: string, codeCheckB64: string): Promise<CryptoKey> {
  const key = await deriveKey(code, saltB64)
  const check = await decryptText(key, codeCheckB64) // throws on wrong code
  if (check !== CODE_CHECK_PLAINTEXT) throw new Error('Invalid code')
  return key
}

/** Create the code_check blob when setting a chat code for the first time. */
export async function makeCodeCheck(key: CryptoKey): Promise<string> {
  return encryptText(key, CODE_CHECK_PLAINTEXT)
}

/** Random 256-bit key for a chat, stored base64 on the chat row. */
export function genChatKeyB64(): string {
  return b64(crypto.getRandomValues(new Uint8Array(32)))
}

/** Turn the stored chat key into a usable AES-GCM CryptoKey. */
export async function importChatKey(keyB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', fromB64(keyB64), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
}
