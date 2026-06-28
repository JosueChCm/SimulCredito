import { useMemo, useState } from 'react'
import { useBank } from '../context/BankContext'
import NumberInput from '../components/NumberInput'
import ResultCard from '../components/ResultCard'
import { compararFinanciamientoCompra, formatearMoneda, formatearPorcentaje } from '../utils/finance'

export default function InstallmentCalculator() {
  const { selectedBank } = useBank()
  const [precioContado, setPrecioContado] = useState(3000)
  const [numCuotas, setNumCuotas] = useState(12)
  const [cuotaMensual, setCuotaMensual] = useState(280)
  const [cuotaInicial, setCuotaInicial] = useState(0)

  const resultado = useMemo(() => {
    if (precioContado <= 0 || numCuotas <= 0 || cuotaMensual <= 0) return null
    return compararFinanciamientoCompra(
      precioContado,
      numCuotas,
      cuotaMensual,
      cuotaInicial,
      selectedBank
    )
  }, [precioContado, numCuotas, cuotaMensual, cuotaInicial, selectedBank])

  return (
    <section className="section">
      <header className="section__header">
        <h2>Compras a plazos</h2>
        <p>
          Descubre la tasa oculta de las promociones en cuotas y compárala con financiar la misma
          compra mediante el crédito de {selectedBank.name}.
        </p>
      </header>

      <div className="section__grid">
        <div className="panel panel--form">
          <h3>Condiciones de la tienda</h3>
          <NumberInput
            label="Precio al contado"
            value={precioContado}
            onChange={setPrecioContado}
            min={100}
            step={50}
            suffix="S/"
          />
          <NumberInput
            label="Número de cuotas"
            value={numCuotas}
            onChange={setNumCuotas}
            min={2}
            max={48}
            suffix="cuotas"
          />
          <NumberInput
            label="Cuota mensual en tienda"
            value={cuotaMensual}
            onChange={setCuotaMensual}
            min={1}
            step={10}
            suffix="S/"
          />
          <NumberInput
            label="Cuota inicial (opcional)"
            value={cuotaInicial}
            onChange={setCuotaInicial}
            min={0}
            step={50}
            suffix="S/"
          />
        </div>

        {resultado && (
          <div className="panel panel--results">
            <h3>Comparación</h3>
            <div className="comparison">
              <div className="comparison__column">
                <h4>Financiamiento en tienda</h4>
                <ResultCard
                  title="TCEA implícita"
                  value={formatearPorcentaje(resultado.tienda.tcea)}
                  variant="default"
                />
                <ResultCard
                  title="Total pagado"
                  value={formatearMoneda(resultado.tienda.totalPagado)}
                />
                <ResultCard
                  title="Costo oculto"
                  value={formatearMoneda(resultado.tienda.costoOculto)}
                  subtitle="Diferencia vs precio al contado"
                />
              </div>

              <div className="comparison__vs">VS</div>

              <div className="comparison__column">
                <h4>Crédito {selectedBank.name}</h4>
                <ResultCard
                  title="TCEA"
                  value={formatearPorcentaje(resultado.banco.tcea)}
                  variant="default"
                />
                <ResultCard
                  title="Total pagado"
                  value={formatearMoneda(resultado.banco.totalPagado)}
                />
                <ResultCard
                  title="Cuota mensual"
                  value={formatearMoneda(resultado.banco.cuotaMensual)}
                />
              </div>
            </div>

            <div
              className={`alert ${
                resultado.opcionRecomendada === 'banco' ? 'alert--success' : 'alert--info'
              }`}
            >
              {resultado.opcionRecomendada === 'banco' ? (
                <>
                  <strong>Recomendación:</strong> Financiar con {selectedBank.name} te ahorra{' '}
                  {formatearMoneda(resultado.ahorro)} en total.
                </>
              ) : (
                <>
                  <strong>Recomendación:</strong> La opción de la tienda resulta más económica
                  por {formatearMoneda(resultado.ahorro)}.
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
