import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { getScoreRange, formatCurrency } from '../utils/scoring'
import ScoreGauge from '../components/ScoreGauge'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  const { user } = useAuth()
  const { getMyClients, getMyEvaluations } = useApp()
  const clients = getMyClients()
  const evaluations = getMyEvaluations()

  const approved = evaluations.filter(e => e.approved)
  const rejected = evaluations.filter(e => !e.approved)
  const avgScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((s, e) => s + e.score, 0) / evaluations.length)
    : 0

  const totalRequested = evaluations.reduce((s, e) => s + (e.requestedAmount || 0), 0)
  const totalApproved = approved.reduce((s, e) => s + (e.requestedAmount || 0), 0)

  const recentEvals = [...evaluations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5)

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Dashboard</h2>
          <p className="page__subtitle">Bienvenido, {user?.name}</p>
        </div>
        <Link to="/nueva-evaluacion" className="btn btn--primary btn--inline">+ Nueva Evaluación</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-card__label">Clientes</span>
          <span className="stat-card__value">{clients.length}</span>
          <span className="stat-card__hint">registrados</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Evaluaciones</span>
          <span className="stat-card__value">{evaluations.length}</span>
          <span className="stat-card__hint">realizadas</span>
        </div>
        <div className="stat-card stat-card--success">
          <span className="stat-card__label">Aprobados</span>
          <span className="stat-card__value">{approved.length}</span>
          <span className="stat-card__hint">{evaluations.length > 0 ? `${((approved.length / evaluations.length) * 100).toFixed(0)}% tasa` : 'sin datos'}</span>
        </div>
        <div className="stat-card stat-card--danger">
          <span className="stat-card__label">Rechazados</span>
          <span className="stat-card__value">{rejected.length}</span>
          <span className="stat-card__hint">{evaluations.length > 0 ? `${((rejected.length / evaluations.length) * 100).toFixed(0)}% tasa` : 'sin datos'}</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <h3>Score Promedio</h3>
          {evaluations.length > 0 ? (
            <div className="panel__center">
              <ScoreGauge score={avgScore} size={200} />
              <div className="panel__stats-row">
                <div>
                  <span className="panel__stat-label">Monto solicitado</span>
                  <span className="panel__stat-value">{formatCurrency(totalRequested)}</span>
                </div>
                <div>
                  <span className="panel__stat-label">Monto aprobado</span>
                  <span className="panel__stat-value panel__stat-value--accent">{formatCurrency(totalApproved)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="panel__empty">
              <p>Aún no hay evaluaciones</p>
              <Link to="/nueva-evaluacion" className="btn btn--primary btn--sm">Crear primera evaluación</Link>
            </div>
          )}
        </div>

        <div className="panel">
          <h3>Evaluaciones Recientes</h3>
          {recentEvals.length > 0 ? (
            <div className="eval-list">
              {recentEvals.map(ev => {
                const range = getScoreRange(ev.score)
                const client = clients.find(c => c.id === ev.clientId)
                return (
                  <div key={ev.id} className="eval-list__item">
                    <div className="eval-list__score" style={{ color: range.color }}>{ev.score}</div>
                    <div className="eval-list__info">
                      <span className="eval-list__name">{client?.fullName || 'Cliente'}</span>
                      <span className="eval-list__date">{new Date(ev.createdAt).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div className={`eval-list__badge ${ev.approved ? 'eval-list__badge--ok' : 'eval-list__badge--no'}`}>
                      {ev.approved ? 'Aprobado' : 'Rechazado'}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="panel__empty">
              <p>Sin evaluaciones recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
