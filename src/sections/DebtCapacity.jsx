import { useMemo, useState } from 'react'
import { useBank } from '../context/BankContext'
import NumberInput from '../components/NumberInput'
import ResultCard from '../components/ResultCard'
import ScheduleTable from '../components/ScheduleTable'
import {
  evaluarCapacidadEndeudamiento,
  formatearMoneda,
  formatearPorcentaje,
} from '../utils/finance'

export default function DebtCapacity() {
  const { selectedBank } = useBank()
  const [ingresos, setIngresos] = useState(5000)
  const [deudas, setDeudas] = useState(800)
  const [plazo, setPlazo] = useState(36)

  const resultado = useMemo(() => {
    if (ingresos <= 0) return null
    return evaluarCapacidadEndeudamiento(ingresos, deudas, selectedBank, plazo)
  }, [ingresos, deudas, plazo, selectedBank])

  return (
    <section className="section">
      <header className="section__header">
        <h2>Capacidad de endeudamiento</h2>
        <p>
          Calcula cuánto puedes pedir prestado de forma responsable según el ratio cuota-ingreso
          de {selectedBank.name} ({formatearPorcentaje(selectedBank.ratioCuotaIngreso, 0)}).
        </p>
      </header>

      <div className="section__grid">
        <div className="panel panel--form">
          <h3>Tu situación financiera</h3>
          <NumberInput
            label="Ingresos mensuales"
            value={ingresos}
            onChange={setIngresos}
            min={500}
            step={100}
            suffix="S/"
          />
          <NumberInput
            label="Deudas actuales (cuotas mensuales)"
            value={deudas}
            onChange={setDeudas}
            min={0}
            step={50}
            suffix="S/"
            hint="Suma de todas tus cuotas de deuda vigentes"
          />
          <NumberInput
            label="Plazo deseado"
            value={plazo}
            onChange={setPlazo}
            min={6}
            max={120}
            suffix="meses"
          />
        </div>

        {resultado && (
          <div className="panel panel--results">
            <h3>Resultado</h3>
            <div className="results-grid">
              <ResultCard
                title="Cuota máxima"
                value={formatearMoneda(resultado.cuotaMaxima)}
                subtitle="Lo máximo que puedes asumir mensualmente"
                variant="primary"
              />
              <ResultCard
                title="Monto máximo de préstamo"
                value={formatearMoneda(resultado.montoMaximo)}
                subtitle={`A ${plazo} meses con ${selectedBank.name}`}
                variant="accent"
              />
              {resultado.tcea > 0 && (
                <ResultCard
                  title="TCEA estimada"
                  value={formatearPorcentaje(resultado.tcea)}
                  subtitle="Del monto máximo calculado"
                />
              )}
            </div>

            {resultado.cuotaMaxima <= 0 && (
              <p className="alert alert--warning">
                Tus deudas actuales superan el límite permitido. Reduce deudas antes de solicitar
                un nuevo crédito.
              </p>
            )}
          </div>
        )}
      </div>

      {resultado?.cronograma && (
        <div className="panel">
          <h3>Cronograma del monto máximo</h3>
          <p className="panel__description">
            Este es el cronograma que obtendrías si solicitas el monto máximo calculado.
          </p>
          <ScheduleTable filas={resultado.cronograma.filas} />
        </div>
      )}
    </section>
  )
}
