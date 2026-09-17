'use client'
import { createBrowserClient } from '@supabase/ssr'

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

/**
 * True when a request never got an answer from Supabase — offline, DNS
 * failure, or a paused free-tier project (its hostname stops resolving).
 * postgrest-js returns these as `{ data: null, error: { message: 'TypeError:
 * Failed to fetch' } }`; auth-js throws `AuthRetryableFetchError`.
 */
export function isUnreachable(e: unknown): boolean {
  const err = e as { name?: string; message?: string } | null | undefined
  if (!err) return false
  if (err.name === 'AuthRetryableFetchError') return true
  return /failed to fetch|fetch failed|load failed|networkerror|network request failed/i.test(err.message ?? '')
}

export const UNREACHABLE_MSG =
  "Can't reach Mivloc's server right now. Please try again in a minute."

/** User-facing text for a failed Supabase call. */
export function describeError(e: unknown): string {
  if (isUnreachable(e)) return UNREACHABLE_MSG
  const m = (e as { message?: string } | null | undefined)?.message
  return m ? `Server error: ${m}` : 'Something went wrong. Please try again.'
}
