import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { evaluateClient, formatCurrency, formatPct, getScoreRange } from '../utils/scoring'
import ScoreGauge from '../components/ScoreGauge'

export default function NewEvaluation() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { getMyClients, addEvaluation, getClientEvaluations } = useApp()
  const clients = getMyClients()

  const [clientId, setClientId] = useState(searchParams.get('clientId') || '')
  const [params, setParams] = useState({ requestedAmount: '', annualRate: '18', termMonths: '12' })
  const [result, setResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const selectedClient = useMemo(() => clients.find(c => c.id === clientId), [clients, clientId])
  const previousEvals = useMemo(() => clientId ? getClientEvaluations(clientId) : [], [clientId, getClientEvaluations])

  function setParam(field) {
    return e => setParams(prev => ({ ...prev, [field]: e.target.value }))
  }

  function handleEvaluate(e) {
    e.preventDefault()
    if (!selectedClient) return
    setSaved(false)
    const res = evaluateClient(selectedClient, {
      requestedAmount: parseFloat(params.requestedAmount) || 0,
      annualRate: parseFloat(params.annualRate) || 15,
      termMonths: parseInt(params.termMonths) || 12,
    })
    setResult(res)
  }

  function handleSave() {
    if (!result || !selectedClient) return
    addEvaluation({
      clientId: selectedClient.id,
      clientName: selectedClient.fullName,
      ...result,
    })
    setSaved(true)
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h2 className="page__title">Nueva Evaluación</h2>
          <p className="page__subtitle">Evalúa la capacidad crediticia de un cliente</p>
        </div>
      </div>

      <div className="eval-layout">
        <form className="panel" onSubmit={handleEvaluate}>
          <h3>Parámetros</h3>

          <div className="form-field">
            <label className="form-field__label">Cliente *</label>
            <select className="form-field__input" value={clientId} onChange={e => { setClientId(e.target.value); setResult(null) }} required>
              <option value="">Seleccionar cliente...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.fullName} — DNI: {c.dni || 'S/N'}</option>)}
            </select>
          </div>

          {selectedClient && (
            <div className="client-preview">
              <div className="client-preview__row"><span>Ingreso mensual</span><strong>S/ {Number(selectedClient.monthlyIncome).toLocaleString()}</strong></div>
              <div className="client-preview__row"><span>Deudas actuales</span><strong>S/ {Number(selectedClient.currentDebts).toLocaleString()}</strong></div>
              <div className="client-preview__row"><span>Empleo</span><strong>{selectedClient.employmentType} — {selectedClient.yearsEmployed} años</strong></div>
              <div className="client-preview__row"><span>Historial</span><strong>{selectedClient.creditHistory?.replace('_', ' ')}</strong></div>
              {previousEvals.length > 0 && (
                <div className="client-preview__prev">
                  {previousEvals.length} evaluación(es) previa(s) — último score: {previousEvals[previousEvals.length - 1].score}
                </div>
              )}
            </div>
          )}

          <div className="form-field">
            <label className="form-field__label">Monto solicitado (S/) *</label>
            <input className="form-field__input" type="number" value={params.requestedAmount} onChange={setParam('requestedAmount')} required min="1" />
          </div>

          <div className="form-grid form-grid--2">
            <div className="form-field">
              <label className="form-field__label">Tasa anual (%)</label>
              <input className="form-field__input" type="number" value={params.annualRate} onChange={setParam('annualRate')} min="1" max="100" step="0.5" />
            </div>
            <div className="form-field">
              <label className="form-field__label">Plazo (meses)</label>
              <input className="form-field__input" type="number" value={params.termMonths} onChange={setParam('termMonths')} min="1" max="360" />
            </div>
          </div>

          <button type="submit" className="btn btn--primary" disabled={!clientId}>Evaluar</button>
        </form>

        <div className="eval-result-area">
          {result ? (
            <div className="panel eval-result">
              <h3>Resultado de Evaluación</h3>

              <div className="eval-result__top">
                <ScoreGauge score={result.score} size={180} />
                <div className={`eval-result__verdict ${result.approved ? 'eval-result__verdict--ok' : 'eval-result__verdict--no'}`}>
                  {result.approved ? 'APROBADO' : 'RECHAZADO'}
                </div>
              </div>

              <div className="eval-result__summary">
                <div className="eval-result__item">
                  <span>Monto solicitado</span>
                  <strong>{formatCurrency(result.requestedAmount)}</strong>
                </div>
                <div className="eval-result__item">
                  <span>Cuota mensual estimada</span>
                  <strong>{formatCurrency(result.monthlyPaymentEstimate)}</strong>
                </div>
                <div className="eval-result__item">
                  <span>Cuota / Ingreso</span>
                  <strong className={result.paymentToIncomeRatio > 0.4 ? 'text-danger' : 'text-success'}>
                    {formatPct(result.paymentToIncomeRatio * 100)}
                  </strong>
                </div>
                <div className="eval-result__item">
                  <span>Monto máx. recomendado</span>
                  <strong>{formatCurrency(result.maxRecommendedAmount)}</strong>
                </div>
              </div>

              <div className="eval-result__details">
                <h4>Desglose del Score</h4>
                {result.details.map((d, i) => (
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

              {!saved ? (
                <button className="btn btn--primary" onClick={handleSave}>Guardar Evaluación</button>
              ) : (
                <div className="eval-result__saved">
                  Evaluación guardada correctamente
                  <button className="btn btn--sm btn--ghost" onClick={() => navigate('/historial')}>Ver historial</button>
                </div>
              )}
            </div>
          ) : (
            <div className="panel panel--empty">
              <div className="panel__empty">
                <p>Selecciona un cliente y completa los parámetros para generar la evaluación crediticia</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
