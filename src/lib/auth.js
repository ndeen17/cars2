import { useSyncExternalStore } from 'react'
import { USERS, ROLES, DEMO_PASSWORD } from '../data/users'

// Demo session kept in sessionStorage (cleared when the tab closes).
const KEY = 'vanta-session-v1'

function load() {
  try {
    const id = sessionStorage.getItem(KEY)
    return USERS.find(u => u.id === id) || null
  } catch { return null }
}

let user = load()
const listeners = new Set()
const emit = () => listeners.forEach(l => l())
const subscribe = l => { listeners.add(l); return () => listeners.delete(l) }

export function useSession() {
  const u = useSyncExternalStore(subscribe, () => user)
  return u ? { user: u, role: ROLES[u.role] } : null
}

export function signIn(email, password) {
  const u = USERS.find(x => x.email === email.trim().toLowerCase())
  if (!u || password !== DEMO_PASSWORD) return { error: 'Incorrect email or password.' }
  user = u
  try { sessionStorage.setItem(KEY, u.id) } catch { /* ignore */ }
  emit()
  return { user: u }
}

export function signOut() {
  user = null
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
  emit()
}

export const currentRoleKey = () => user?.role ?? null
