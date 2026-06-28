import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { getScoreRange, formatCurrency } from '../utils/scoring'
import ScoreGauge from '../components/ScoreGauge'

export default function HistoryPage() {
  const { getMyEvaluations, getMyClients } = useApp()
  const evaluations = getMyEvaluations()
  const clients = getMyClients()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const sorted = [...evaluations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const filtered = sorted.filter(e => {
    if (filter === 'approved') return e.approved
    if (filter === 'rejected') return !e.approved
    return true
  })

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Historial de Evaluaciones</h2>
          <p className="page__subtitle">{evaluations.length} evaluaciones realizadas</p>
        </div>
      </div>

      <div className="filter-bar">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'approved', label: 'Aprobadas' },
          { key: 'rejected', label: 'Rechazadas' },
        ].map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'filter-btn--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="panel eval-detail">
          <button className="eval-detail__back" onClick={() => setSelected(null)}>← Volver al listado</button>

          <div className="eval-detail__header">
            <div>
              <h3>{selected.clientName}</h3>
              <span className="eval-detail__date">{new Date(selected.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="eval-detail__analyst">Analista: {selected.analystName}</span>
            </div>
            <div className={`eval-result__verdict ${selected.approved ? 'eval-result__verdict--ok' : 'eval-result__verdict--no'}`}>
              {selected.approved ? 'APROBADO' : 'RECHAZADO'}
            </div>
          </div>

          <div className="eval-detail__body">
            <ScoreGauge score={selected.score} size={180} />

            <div className="eval-result__summary">
              <div className="eval-result__item"><span>Monto solicitado</span><strong>{formatCurrency(selected.requestedAmount)}</strong></div>
              <div className="eval-result__item"><span>Cuota mensual</span><strong>{formatCurrency(selected.monthlyPaymentEstimate)}</strong></div>
              <div className="eval-result__item"><span>Tasa anual</span><strong>{selected.annualRate}%</strong></div>
              <div className="eval-result__item"><span>Plazo</span><strong>{selected.termMonths} meses</strong></div>
            </div>

            {selected.details && (
              <div className="eval-result__details">
                <h4>Desglose del Score</h4>
                {selected.details.map((d, i) => (
                  <div key={i} className="score-detail">
                    <div className="score-detail__header">
                      <span className="score-detail__factor">{d.factor}</span>
                      <span className="score-detail__points">{d.points}/{d.max}</span>
                    </div>
                    <div className="score-detail__bar">
                      <div className="score-detail__fill" style={{ width: `${(d.points / d.max) * 100}%` }} />
                    </div>
                    <span className="score-detail__value">{d.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : filtered.length > 0 ? (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Score</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Analista</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => {
                const range = getScoreRange(ev.score)
                return (
                  <tr key={ev.id}>
                    <td>{new Date(ev.createdAt).toLocaleDateString('es-PE')}</td>
                    <td className="history-table__name">{ev.clientName}</td>
                    <td><span className="score-chip" style={{ color: range.color, borderColor: range.color }}>{ev.score}</span></td>
                    <td>{formatCurrency(ev.requestedAmount)}</td>
                    <td>
                      <span className={`status-badge ${ev.approved ? 'status-badge--ok' : 'status-badge--no'}`}>
                        {ev.approved ? 'Aprobado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="history-table__analyst">{ev.analystName}</td>
                    <td><button className="btn btn--sm btn--ghost" onClick={() => setSelected(ev)}>Ver</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="panel panel--empty">
          <div className="panel__empty"><p>No hay evaluaciones {filter !== 'all' ? 'con este filtro' : 'aún'}</p></div>
        </div>
      )}
    </div>
  )
}
