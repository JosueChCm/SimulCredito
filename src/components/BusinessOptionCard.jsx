import { formatearMoneda, formatearPorcentaje } from '../utils/finance'

export default function BusinessOptionCard({
  titulo,
  tasa,
  tasaLabel = 'Tasa',
  montoTotal,
  ahorroFiscal,
  costoNeto,
  isBest = false,
  comparacion = [],
}) {
  const maxCosto = Math.max(...comparacion.map((c) => c.costoNeto), 1)

  return (
    <article className={`business-card ${isBest ? 'business-card--best' : ''}`}>
      <header className="business-card__header">
        <h3>{titulo}</h3>
        {isBest && <span className="business-card__badge">Recomendada</span>}
      </header>

      <div className="business-card__metrics">
        <div className="business-card__row">
          <span className="business-card__label">{tasaLabel}</span>
          <span className="business-card__data">{tasa}</span>
        </div>
        <div className="business-card__row">
          <span className="business-card__label">Monto total</span>
          <span className="business-card__data">{montoTotal}</span>
        </div>
        <div className="business-card__row">
          <span className="business-card__label">Ahorro fiscal</span>
          <span className="business-card__data">{ahorroFiscal}</span>
        </div>
        <div className="business-card__row business-card__row--net">
          <span className="business-card__label">Costo neto</span>
          <span className="business-card__data business-card__data--net">{costoNeto}</span>
        </div>
      </div>

      <div className="business-card__chart">
        <span className="business-card__chart-title">Comparación de costos netos</span>
        <div className="business-card__bars">
          {comparacion.map((item) => {
            const pct = (item.costoNeto / maxCosto) * 100
            const isCurrent = item.titulo === titulo
            return (
              <div key={item.id} className="business-card__bar-row">
                <span className="business-card__bar-label">{item.shortLabel}</span>
                <div className="business-card__bar-track">
                  <div
                    className={`business-card__bar-fill ${isCurrent ? 'business-card__bar-fill--active' : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="business-card__bar-value">
                  {formatearMoneda(item.costoNeto)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </article>
  )
}

export function buildBusinessCards(resultado, banco, valorActivo) {
  const comparacion = [
    { id: 'prestamo', titulo: 'Préstamo bancario', shortLabel: 'Préstamo', costoNeto: resultado.prestamo.costoNeto },
    { id: 'leasing', titulo: 'Leasing financiero', shortLabel: 'Leasing', costoNeto: resultado.leasing.costoNeto },
    { id: 'capital', titulo: 'Capital propio', shortLabel: 'Capital', costoNeto: resultado.capital.costoNeto },
  ]

  const mejorId = resultado.mejorOpcion.id

  return [
    {
      id: 'prestamo',
      titulo: 'Préstamo bancario',
      tasa: formatearPorcentaje(resultado.prestamo.tcea),
      tasaLabel: 'TCEA',
      montoTotal: formatearMoneda(resultado.prestamo.totalPagado),
      ahorroFiscal: formatearMoneda(resultado.prestamo.ahorroFiscal),
      costoNeto: formatearMoneda(resultado.prestamo.costoNeto),
      isBest: mejorId === 'prestamo',
      comparacion,
    },
    {
      id: 'leasing',
      titulo: 'Leasing financiero',
      tasa: formatearPorcentaje(banco.tasaLeasing),
      tasaLabel: 'Tasa leasing',
      montoTotal: formatearMoneda(resultado.leasing.totalCuotas + resultado.leasing.valorResidual),
      ahorroFiscal: formatearMoneda(
        resultado.leasing.recuperacionIGV + resultado.leasing.ahorroFiscal
      ),
      costoNeto: formatearMoneda(resultado.leasing.costoNeto),
      isBest: mejorId === 'leasing',
      comparacion,
    },
    {
      id: 'capital',
      titulo: 'Capital propio',
      tasa: formatearPorcentaje(resultado.capital.tasaOportunidad),
      tasaLabel: 'Tasa oportunidad',
      montoTotal: formatearMoneda(valorActivo),
      ahorroFiscal: formatearMoneda(0),
      costoNeto: formatearMoneda(resultado.capital.costoNeto),
      isBest: mejorId === 'capital',
      comparacion,
    },
  ]
}
