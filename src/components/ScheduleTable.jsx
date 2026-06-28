import { formatearMoneda } from '../utils/finance'

export default function ScheduleTable({ filas }) {
  if (!filas?.length) return null

  return (
    <div className="schedule-table-wrap">
      <table className="schedule-table">
        <thead>
          <tr>
            <th>Periodo</th>
            <th>Cuota total</th>
            <th>Capital</th>
            <th>Interés</th>
            <th>Seguro</th>
            <th>ITF</th>
            <th>Amortización</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr key={fila.periodo}>
              <td>{fila.periodo}</td>
              <td>{formatearMoneda(fila.cuota)}</td>
              <td>{formatearMoneda(fila.cuotaCapital)}</td>
              <td>{formatearMoneda(fila.interes)}</td>
              <td>{formatearMoneda(fila.seguro)}</td>
              <td>{formatearMoneda(fila.itf)}</td>
              <td>{formatearMoneda(fila.amortizacion)}</td>
              <td>{formatearMoneda(fila.saldo)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
