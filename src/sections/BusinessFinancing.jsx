import { useMemo, useState } from 'react'
import { useBank } from '../context/BankContext'
import NumberInput from '../components/NumberInput'
import BusinessOptionCard, { buildBusinessCards } from '../components/BusinessOptionCard'
import { formatearMoneda, simularFinanciamientoEmpresarial } from '../utils/finance'

export default function BusinessFinancing() {
  const { selectedBank } = useBank()
  const [valorActivo, setValorActivo] = useState(150000)
  const [plazo, setPlazo] = useState(48)
  const [valorResidualPct, setValorResidualPct] = useState(10)

  const resultado = useMemo(() => {
    if (valorActivo <= 0 || plazo <= 0) return null
    return simularFinanciamientoEmpresarial({
      valorActivo,
      plazoMeses: plazo,
      banco: selectedBank,
      valorResidualPct: valorResidualPct / 100,
    })
  }, [valorActivo, plazo, valorResidualPct, selectedBank])

  const tarjetas = resultado ? buildBusinessCards(resultado, selectedBank, valorActivo) : []

  return (
    <section className="section">
      <header className="section__header">
        <h2>Financiamiento empresarial</h2>
        <p>
          Compara préstamo bancario, leasing y capital propio considerando IGV, escudo fiscal y
          costo de oportunidad. Elige la vía con menor costo neto.
        </p>
      </header>

      <div className="business-layout">
        <div className="business-layout__top">
          <div className="panel panel--form business-layout__form">
            <h3>Datos del activo</h3>
            <NumberInput
              label="Valor del activo (equipo/maquinaria)"
              value={valorActivo}
              onChange={setValorActivo}
              min={10000}
              step={5000}
              suffix="S/"
            />
            <NumberInput
              label="Plazo de financiamiento"
              value={plazo}
              onChange={setPlazo}
              min={12}
              max={84}
              suffix="meses"
            />
            <NumberInput
              label="Valor residual leasing"
              value={valorResidualPct}
              onChange={setValorResidualPct}
              min={0}
              max={30}
              suffix="%"
              hint="Porcentaje del valor del activo al final del leasing"
            />
          </div>

          <div className="panel panel--best business-layout__best">
            <h3>Mejor opción</h3>
            {resultado ? (
              <div className="best-option">
                <span className="best-option__label">Opción recomendada</span>
                <span className="best-option__name">{resultado.mejorOpcion.nombre}</span>
                <span className="best-option__amount">
                  {formatearMoneda(resultado.mejorOpcion.costoNeto)}
                </span>
                <span className="best-option__hint">Costo neto estimado</span>
                <div className="best-option__savings">
                  Ahorro vs. opción más cara:{' '}
                  <strong>
                    {formatearMoneda(
                      Math.max(
                        resultado.prestamo.costoNeto,
                        resultado.leasing.costoNeto,
                        resultado.capital.costoNeto
                      ) - resultado.mejorOpcion.costoNeto
                    )}
                  </strong>
                </div>
              </div>
            ) : (
              <p className="best-option__empty">
                Ingresa los datos del activo para ver la comparación.
              </p>
            )}
          </div>
        </div>

        {tarjetas.length > 0 && (
          <div className="business-layout__cards">
            {tarjetas.map((tarjeta) => (
              <BusinessOptionCard key={tarjeta.id} {...tarjeta} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
