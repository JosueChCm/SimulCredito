import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  if (user) return <Navigate to="/" replace />

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (mode === 'login') {
      const res = login(form.email, form.password)
      if (!res.ok) setError(res.error)
    } else {
      if (!form.name.trim()) return setError('Ingresa tu nombre')
      const res = register(form.name, form.email, form.password)
      if (!res.ok) setError(res.error)
    }
  }

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">CS</div>
          <h1>CreditSys</h1>
          <p>Sistema de Evaluación Crediticia</p>
        </div>

        <div className="login-tabs">
          <button className={`login-tab ${mode === 'login' ? 'login-tab--active' : ''}`} onClick={() => setMode('login')}>
            Iniciar Sesión
          </button>
          <button className={`login-tab ${mode === 'register' ? 'login-tab--active' : ''}`} onClick={() => setMode('register')}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="login-field">
              <label>Nombre completo</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Tu nombre" />
            </div>
          )}
          <div className="login-field">
            <label>Correo electrónico</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="correo@ejemplo.com" required />
          </div>
          <div className="login-field">
            <label>Contraseña</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit">
            {mode === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <div className="login-demo">
          <span>Demo rápido:</span>
          <button onClick={() => { setForm({ name: '', email: 'admin@creditsys.pe', password: 'admin123' }); setMode('login') }}>
            Admin
          </button>
          <button onClick={() => { setForm({ name: '', email: 'carlos@creditsys.pe', password: 'analyst123' }); setMode('login') }}>
            Analista
          </button>
        </div>
      </div>
    </div>
  )
}
