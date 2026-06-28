import { createContext, useContext, useState, useEffect } from 'react'
import { load, save, remove } from '../utils/storage'

const AuthContext = createContext(null)

const DEFAULT_USERS = [
  { id: 'admin1', name: 'Administrador', email: 'admin@creditsys.pe', password: 'admin123', role: 'admin', avatar: 'A' },
  { id: 'analyst1', name: 'Carlos Mendoza', email: 'carlos@creditsys.pe', password: 'analyst123', role: 'analista', avatar: 'C' },
  { id: 'analyst2', name: 'María López', email: 'maria@creditsys.pe', password: 'analyst123', role: 'analista', avatar: 'M' },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!load('users')) save('users', DEFAULT_USERS)
    const saved = load('session')
    if (saved) setUser(saved)
    setLoading(false)
  }, [])

  function login(email, password) {
    const users = load('users', DEFAULT_USERS)
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { ok: false, error: 'Credenciales incorrectas' }
    const session = { id: found.id, name: found.name, email: found.email, role: found.role, avatar: found.avatar }
    save('session', session)
    setUser(session)
    return { ok: true }
  }

  function register(name, email, password, role = 'analista') {
    const users = load('users', DEFAULT_USERS)
    if (users.find(u => u.email === email)) return { ok: false, error: 'El correo ya está registrado' }
    const newUser = { id: Date.now().toString(36), name, email, password, role, avatar: name.charAt(0).toUpperCase() }
    users.push(newUser)
    save('users', users)
    const session = { id: newUser.id, name, email, role, avatar: newUser.avatar }
    save('session', session)
    setUser(session)
    return { ok: true }
  }

  function logout() {
    remove('session')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
