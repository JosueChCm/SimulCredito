const PREFIX = 'creditsys_'

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

export function remove(key) {
  localStorage.removeItem(PREFIX + key)
}

export function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
