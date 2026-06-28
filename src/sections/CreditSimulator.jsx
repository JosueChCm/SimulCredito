import { useRef, useState } from 'react'
import { useBank } from '../context/BankContext'
import NumberInput from '../components/NumberInput'
import CreditSummary from '../components/CreditSummary'
import BankCreditDocument from '../components/BankCreditDocument'
import {
  calcularTCEA,
  generarCronograma,
  generarNumeroSimulacion,
} from '../utils/finance'

export default function CreditSimulator() {
  const { selectedBank } = useBank()
  const [monto, setMonto] = useState(50000)
  const [plazo, setPlazo] = useState(36)
  const [simulacion, setSimulacion] = useState(null)
  const docRef = useRef(null)

  const handleSimular = () => {
    if (monto <= 0 || plazo <= 0) return

    const cronograma = generarCronograma(monto, plazo, selectedBank)
    const tcea = calcularTCEA(monto, cronograma)

    setSimulacion({
      monto,
      plazo,
      cronograma,
      tcea,
      banco: selectedBank,
      numeroSimulacion: generarNumeroSimulacion(selectedBank.id),
      fechaEmision: new Date(),
    })

    setTimeout(() => {
      docRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <section className="section">
      <header className="section__header">
        <h2>Simulador de crédito</h2>
        <p>
          Genera el cronograma completo con TCEA real — intereses, seguro de desgravamen e ITF
          incluidos. Conoce el costo verdadero antes de endeudarte.
        </p>
      </header>

      <div className="section__grid">
        <div className="panel panel--form">
          <h3>Datos del préstamo</h3>
          <NumberInput
            label="Monto del préstamo"
            value={monto}
            onChange={setMonto}
            min={1000}
            step={500}
            suffix="S/"
            hint="Cantidad que deseas solicitar"
          />
          <NumberInput
            label="Plazo"
            value={plazo}
            onChange={setPlazo}
            min={6}
            max={120}
            step={1}
            suffix="meses"
            hint="Número de cuotas mensuales"
          />

          <button type="button" className="btn btn--primary" onClick={handleSimular}>
            Simular crédito
          </button>
        </div>

        {simulacion && (
          <div className="panel panel--results">
            <h3>Resumen</h3>
            <CreditSummary
              cronograma={simulacion.cronograma}
              tcea={simulacion.tcea}
              numeroSimulacion={simulacion.numeroSimulacion}
            />
          </div>
        )}
      </div>

      {simulacion && (
        <div ref={docRef}>
          <div className="doc-divider">
            <span>Documento oficial de simulación</span>
          </div>
          <BankCreditDocument
            banco={simulacion.banco}
            monto={simulacion.monto}
            plazo={simulacion.plazo}
            cronograma={simulacion.cronograma}
            tcea={simulacion.tcea}
            numeroSimulacion={simulacion.numeroSimulacion}
            fechaEmision={simulacion.fechaEmision}
          />
        </div>
      )}
    </section>
  )
}
