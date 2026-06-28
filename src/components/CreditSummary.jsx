import DonutChart from './DonutChart'
import { formatearMoneda, formatearPorcentaje } from '../utils/finance'

export default function CreditSummary({ cronograma, tcea, numeroSimulacion }) {
  const { resumen } = cronograma
  const monto = resumen.monto
  const otrosCargos = resumen.totalSeguro + resumen.totalItf

  const segments = [
    { id: 'capital', label: 'Capital', value: monto },
    { id: 'intereses', label: 'Intereses', value: resumen.totalIntereses },
    { id: 'cargos', label: 'Seguro + ITF', value: otrosCargos },
  ]

  return (
    <div className="credit-summary">
      <div className="credit-summary__hero">
        <div className="credit-summary__metric credit-summary__metric--primary">
          <span className="credit-summary__label">Cuota mensual</span>
          <span className="credit-summary__value">{formatearMoneda(resumen.cuotaMensual)}</span>
          <span className="credit-summary__note">Capital + interés + seguro + ITF</span>
        </div>
        <div className="credit-summary__divider" />
        <div className="credit-summary__metric credit-summary__metric--accent">
          <span className="credit-summary__label">TCEA</span>
          <span className="credit-summary__value">{formatearPorcentaje(tcea)}</span>
          <span className="credit-summary__note">Costo efectivo anual real</span>
        </div>
      </div>

      <div className="credit-summary__body">
        <div className="credit-summary__grid">
          <div className="credit-summary__cell">
            <span className="credit-summary__cell-label">Total intereses</span>
            <span className="credit-summary__cell-value">{formatearMoneda(resumen.totalIntereses)}</span>
          </div>
          <div className="credit-summary__cell">
            <span className="credit-summary__cell-label">Seguro + ITF</span>
            <span className="credit-summary__cell-value">{formatearMoneda(otrosCargos)}</span>
          </div>
          <div className="credit-summary__cell">
            <span className="credit-summary__cell-label">Monto solicitado</span>
            <span className="credit-summary__cell-value">{formatearMoneda(monto)}</span>
          </div>
          <div className="credit-summary__cell credit-summary__cell--highlight">
            <span className="credit-summary__cell-label">Total a pagar</span>
            <span className="credit-summary__cell-value">{formatearMoneda(resumen.totalPagado)}</span>
          </div>
        </div>

        <DonutChart segments={segments} />
      </div>

      <p className="credit-summary__ref">Ref: {numeroSimulacion}</p>
    </div>
  )
}
