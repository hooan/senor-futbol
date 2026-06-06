/**
 * guestSession — localStorage helper for guest quiniela identity.
 *
 * After joining as a guest the client receives a unique guest_token UUID
 * and a participant_id. Both are stored here so the guest can:
 *   - Predict matches across page reloads (same device/browser)
 *   - Restore their session if they arrive via a bookmarked URL that
 *     contains ?guest_token= (cross-device)
 *
 * Storage key: "quiniela_guests"
 * Shape: { [quinielaId: string]: GuestSession }
 */

export interface GuestSession {
  /** quiniela_participants.id — used to scope DB queries */
  participant_id: string
  /** quiniela_participants.guest_token — the identity secret */
  guest_token: string
  /** Display name entered at join time */
  guest_name: string
}

const STORAGE_KEY = 'quiniela_guests'

function readAll(): Record<string, GuestSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Record<string, GuestSession>) : {}
  } catch {
    return {}
  }
}

function writeAll(sessions: Record<string, GuestSession>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  } catch {
    // localStorage unavailable (private mode, storage full) — silently no-op
  }
}

export const guestSession = {
  /** Retrieve the stored guest session for a quiniela, or null. */
  get(quinielaId: string): GuestSession | null {
    return readAll()[quinielaId] ?? null
  },

  /** Persist a guest session after joining a quiniela. */
  set(quinielaId: string, session: GuestSession): void {
    const all = readAll()
    all[quinielaId] = session
    writeAll(all)
  },

  /** Remove the guest session for a quiniela (e.g. if participant is deleted). */
  remove(quinielaId: string): void {
    const all = readAll()
    delete all[quinielaId]
    writeAll(all)
  },

  /**
   * Read ?guest_token= from the current URL without triggering a re-render.
   * Safe to call outside React components.
   */
  getTokenFromUrl(): string | null {
    try {
      return new URLSearchParams(window.location.search).get('guest_token')
    } catch {
      return null
    }
  },
}
