import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

export default function ClientsPage() {
  const { getMyClients, addClient, deleteClient } = useApp()
  const clients = getMyClients()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    fullName: '', dni: '', phone: '', email: '',
    monthlyIncome: '', currentDebts: '', yearsEmployed: '',
    employmentType: 'formal', creditHistory: 'bueno', occupation: '', company: '',
  })

  const filtered = clients.filter(c =>
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.dni?.includes(search)
  )

  function set(field) {
    return e => setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    addClient({
      ...form,
      monthlyIncome: parseFloat(form.monthlyIncome) || 0,
      currentDebts: parseFloat(form.currentDebts) || 0,
      yearsEmployed: parseFloat(form.yearsEmployed) || 0,
    })
    setForm({ fullName: '', dni: '', phone: '', email: '', monthlyIncome: '', currentDebts: '', yearsEmployed: '', employmentType: 'formal', creditHistory: 'bueno', occupation: '', company: '' })
    setShowForm(false)
  }

  function handleDelete(id, name) {
    if (confirm(`¿Eliminar al cliente ${name} y todas sus evaluaciones?`)) {
      deleteClient(id)
    }
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Clientes</h2>
          <p className="page__subtitle">{clients.length} clientes registrados</p>
        </div>
        <button className="btn btn--primary btn--inline" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Cliente'}
        </button>
      </div>

      {showForm && (
        <form className="client-form panel" onSubmit={handleSubmit}>
          <h3>Registrar Nuevo Cliente</h3>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-field__label">Nombre completo *</label>
              <input className="form-field__input" value={form.fullName} onChange={set('fullName')} required />
            </div>
            <div className="form-field">
              <label className="form-field__label">DNI</label>
              <input className="form-field__input" value={form.dni} onChange={set('dni')} maxLength={8} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Teléfono</label>
              <input className="form-field__input" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Correo</label>
              <input className="form-field__input" type="email" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Ingreso mensual (S/) *</label>
              <input className="form-field__input" type="number" value={form.monthlyIncome} onChange={set('monthlyIncome')} required min="0" />
            </div>
            <div className="form-field">
              <label className="form-field__label">Deudas actuales (S/)</label>
              <input className="form-field__input" type="number" value={form.currentDebts} onChange={set('currentDebts')} min="0" />
            </div>
            <div className="form-field">
              <label className="form-field__label">Ocupación</label>
              <input className="form-field__input" value={form.occupation} onChange={set('occupation')} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Empresa</label>
              <input className="form-field__input" value={form.company} onChange={set('company')} />
            </div>
            <div className="form-field">
              <label className="form-field__label">Años de empleo</label>
              <input className="form-field__input" type="number" value={form.yearsEmployed} onChange={set('yearsEmployed')} min="0" step="0.5" />
            </div>
            <div className="form-field">
              <label className="form-field__label">Tipo de empleo</label>
              <select className="form-field__input" value={form.employmentType} onChange={set('employmentType')}>
                <option value="formal">Formal</option>
                <option value="independiente">Independiente</option>
                <option value="informal">Informal</option>
                <option value="desempleado">Desempleado</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-field__label">Historial crediticio</label>
              <select className="form-field__input" value={form.creditHistory} onChange={set('creditHistory')}>
                <option value="excelente">Excelente</option>
                <option value="bueno">Bueno</option>
                <option value="regular">Regular</option>
                <option value="malo">Malo</option>
                <option value="sin_historial">Sin historial</option>
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn--primary" style={{ marginTop: '1rem' }}>Registrar Cliente</button>
        </form>
      )}

      <div className="search-bar">
        <input
          className="search-bar__input"
          placeholder="Buscar por nombre o DNI..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div className="client-grid">
          {filtered.map(client => (
            <div key={client.id} className="client-card">
              <div className="client-card__avatar">{client.fullName.charAt(0)}</div>
              <div className="client-card__body">
                <h4 className="client-card__name">{client.fullName}</h4>
                <span className="client-card__dni">DNI: {client.dni || '—'}</span>
                <div className="client-card__details">
                  <span>Ingreso: S/ {Number(client.monthlyIncome).toLocaleString()}</span>
                  <span>{client.employmentType}</span>
                  <span>{client.creditHistory?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="client-card__actions">
                <Link to={`/nueva-evaluacion?clientId=${client.id}`} className="btn btn--sm btn--primary">Evaluar</Link>
                <button className="btn btn--sm btn--ghost" onClick={() => handleDelete(client.id, client.fullName)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel panel--empty">
          <p>{search ? 'Sin resultados para la búsqueda' : 'No hay clientes registrados aún'}</p>
          {!search && <button className="btn btn--primary btn--sm" onClick={() => setShowForm(true)}>Registrar primer cliente</button>}
        </div>
      )}
    </div>
  )
}
