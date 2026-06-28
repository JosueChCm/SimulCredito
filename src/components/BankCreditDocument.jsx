import {
  calcularTEA,
  formatearFecha,
  formatearFechaCorta,
  formatearMoneda,
  formatearPorcentaje,
  calcularFechaPago,
} from '../utils/finance'
import './BankCreditDocument.css'

export default function BankCreditDocument({ banco, monto, plazo, cronograma, tcea, numeroSimulacion, fechaEmision }) {
  const resumen = cronograma.resumen
  const tea = calcularTEA(banco.tasaNominalAnual)
  const fechaPrimerPago = new Date(fechaEmision)
  fechaPrimerPago.setMonth(fechaPrimerPago.getMonth() + 1)

  const handlePrint = () => window.print()

  return (
    <div className="bank-doc-container">
      <div className="bank-doc-actions no-print">
        <button type="button" className="bank-doc-print-btn" onClick={handlePrint}>
          ⎙ Imprimir / Guardar PDF
        </button>
      </div>

      <article className="bank-doc" id="bank-credit-document">
        {/* Encabezado institucional */}
        <header className="bank-doc__header" style={{ borderBottomColor: banco.colorMarca }}>
          <div className="bank-doc__header-left">
            <div className="bank-doc__logo" style={{ backgroundColor: banco.colorMarca }}>
              {banco.name}
            </div>
            <div className="bank-doc__entity-info">
              <strong>{banco.nombreCompleto}</strong>
              <span>RUC: {banco.ruc}</span>
              <span>Supervisado por la SBS</span>
            </div>
          </div>
          <div className="bank-doc__header-right">
            <span className="bank-doc__doc-type">HOJA RESUMEN</span>
            <span className="bank-doc__doc-subtype">Simulación de Crédito</span>
            <span className="bank-doc__ref">N° {numeroSimulacion}</span>
          </div>
        </header>

        {/* Barra de datos del documento */}
        <div className="bank-doc__meta-bar" style={{ backgroundColor: banco.colorMarcaOscuro }}>
          <span>Fecha de emisión: {formatearFecha(fechaEmision)}</span>
          <span>Moneda: Soles (PEN)</span>
          <span>Vigencia: 30 días calendario</span>
        </div>

        {/* Aviso legal superior */}
        <div className="bank-doc__disclaimer-top">
          <strong>DOCUMENTO INFORMATIVO — NO CONSTITUYE OFERTA VINCULANTE</strong>
          <p>
            La presente simulación tiene carácter referencial. Las condiciones finales del crédito
            están sujetas a evaluación crediticia, políticas internas de {banco.nombreCompleto} y
            aprobación del comité de créditos. Los montos pueden variar según el perfil del
            solicitante.
          </p>
        </div>

        {/* Sección: Datos del producto */}
        <section className="bank-doc__section">
          <h3 className="bank-doc__section-title" style={{ color: banco.colorMarca }}>
            I. DATOS DEL PRODUCTO
          </h3>
          <table className="bank-doc__info-table">
            <tbody>
              <tr>
                <td className="bank-doc__label">Producto</td>
                <td className="bank-doc__value">{banco.productoCredito}</td>
                <td className="bank-doc__label">Sistema de amortización</td>
                <td className="bank-doc__value">Francés (cuota fija)</td>
              </tr>
              <tr>
                <td className="bank-doc__label">Monto simulado</td>
                <td className="bank-doc__value bank-doc__value--highlight">{formatearMoneda(monto)}</td>
                <td className="bank-doc__label">Plazo</td>
                <td className="bank-doc__value">{plazo} meses ({plazo} cuotas)</td>
              </tr>
              <tr>
                <td className="bank-doc__label">Tasa nominal anual (TNA)</td>
                <td className="bank-doc__value">{formatearPorcentaje(banco.tasaNominalAnual)}</td>
                <td className="bank-doc__label">Tasa efectiva anual (TEA)</td>
                <td className="bank-doc__value">{formatearPorcentaje(tea)}</td>
              </tr>
              <tr>
                <td className="bank-doc__label">TCEA</td>
                <td className="bank-doc__value bank-doc__value--tcea">{formatearPorcentaje(tcea)}</td>
                <td className="bank-doc__label">Seguro desgravamen</td>
                <td className="bank-doc__value">
                  {(banco.seguroDesgravamen * 100).toFixed(3)}% mensual sobre saldo
                </td>
              </tr>
              <tr>
                <td className="bank-doc__label">ITF</td>
                <td className="bank-doc__value">0.005% por operación</td>
                <td className="bank-doc__label">Fecha estimada 1er pago</td>
                <td className="bank-doc__value">{formatearFechaCorta(fechaPrimerPago)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Sección: Resumen financiero */}
        <section className="bank-doc__section">
          <h3 className="bank-doc__section-title" style={{ color: banco.colorMarca }}>
            II. RESUMEN FINANCIERO
          </h3>
          <div className="bank-doc__summary-box" style={{ borderColor: banco.colorMarca }}>
            <div className="bank-doc__summary-item bank-doc__summary-item--main">
              <span className="bank-doc__summary-label">Cuota mensual estimada</span>
              <span className="bank-doc__summary-amount" style={{ color: banco.colorMarca }}>
                {formatearMoneda(resumen.cuotaMensual)}
              </span>
              <span className="bank-doc__summary-note">Incluye capital, intereses, seguro e ITF</span>
            </div>
            <div className="bank-doc__summary-grid">
              <div className="bank-doc__summary-item">
                <span className="bank-doc__summary-label">Desembolso</span>
                <span className="bank-doc__summary-amount">{formatearMoneda(monto)}</span>
              </div>
              <div className="bank-doc__summary-item">
                <span className="bank-doc__summary-label">Total intereses</span>
                <span className="bank-doc__summary-amount">{formatearMoneda(resumen.totalIntereses)}</span>
              </div>
              <div className="bank-doc__summary-item">
                <span className="bank-doc__summary-label">Total seguro desgravamen</span>
                <span className="bank-doc__summary-amount">{formatearMoneda(resumen.totalSeguro)}</span>
              </div>
              <div className="bank-doc__summary-item">
                <span className="bank-doc__summary-label">Total ITF</span>
                <span className="bank-doc__summary-amount">{formatearMoneda(resumen.totalItf)}</span>
              </div>
              <div className="bank-doc__summary-item bank-doc__summary-item--total">
                <span className="bank-doc__summary-label">TOTAL A PAGAR</span>
                <span className="bank-doc__summary-amount">{formatearMoneda(resumen.totalPagado)}</span>
              </div>
              <div className="bank-doc__summary-item">
                <span className="bank-doc__summary-label">Costo total del crédito</span>
                <span className="bank-doc__summary-amount">
                  {formatearMoneda(resumen.totalPagado - monto)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Cronograma */}
        <section className="bank-doc__section bank-doc__section--schedule">
          <h3 className="bank-doc__section-title" style={{ color: banco.colorMarca }}>
            III. CRONOGRAMA DE PAGOS DETALLADO
          </h3>
          <p className="bank-doc__schedule-note">
            Cronograma referencial bajo sistema de amortización francés. Las fechas de pago pueden
            ajustarse según la fecha efectiva de desembolso.
          </p>
          <div className="bank-doc__table-wrap">
            <table className="bank-doc__schedule-table">
              <thead>
                <tr style={{ backgroundColor: banco.colorMarca }}>
                  <th>N°</th>
                  <th>Fecha de pago</th>
                  <th>Cuota total</th>
                  <th>Amortización</th>
                  <th>Intereses</th>
                  <th>Seguro desg.</th>
                  <th>ITF</th>
                  <th>Saldo capital</th>
                </tr>
              </thead>
              <tbody>
                {cronograma.filas.map((fila) => (
                  <tr key={fila.periodo}>
                    <td className="bank-doc__center">{fila.periodo}</td>
                    <td>{formatearFechaCorta(calcularFechaPago(fechaPrimerPago, fila.periodo))}</td>
                    <td className="bank-doc__right bank-doc__bold">{formatearMoneda(fila.cuota)}</td>
                    <td className="bank-doc__right">{formatearMoneda(fila.amortizacion)}</td>
                    <td className="bank-doc__right">{formatearMoneda(fila.interes)}</td>
                    <td className="bank-doc__right">{formatearMoneda(fila.seguro)}</td>
                    <td className="bank-doc__right">{formatearMoneda(fila.itf)}</td>
                    <td className="bank-doc__right">{formatearMoneda(fila.saldo)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bank-doc__totals-row">
                  <td colSpan={2} className="bank-doc__bold">TOTALES</td>
                  <td className="bank-doc__right bank-doc__bold">{formatearMoneda(resumen.totalPagado)}</td>
                  <td className="bank-doc__right">{formatearMoneda(monto)}</td>
                  <td className="bank-doc__right">{formatearMoneda(resumen.totalIntereses)}</td>
                  <td className="bank-doc__right">{formatearMoneda(resumen.totalSeguro)}</td>
                  <td className="bank-doc__right">{formatearMoneda(resumen.totalItf)}</td>
                  <td className="bank-doc__right">—</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* Notas legales */}
        <footer className="bank-doc__footer">
          <h4>NOTAS IMPORTANTES</h4>
          <ol className="bank-doc__legal-list">
            <li>
              La Tasa de Costo Efectiva Anual (TCEA) incluye intereses compensatorios, comisiones,
              seguro de desgravamen obligatorio e Impuesto a las Transacciones Financieras (ITF),
              conforme a la Resolución SBS N° 3274-2017.
            </li>
            <li>
              El seguro de desgravamen es de contratación obligatoria y su costo se calcula sobre
              el saldo de capital insoluto de cada periodo.
            </li>
            <li>
              El incumplimiento en el pago de las cuotas genera intereses moratorios y gastos de
              cobranza según tarifario vigente.
            </li>
            <li>
              Esta simulación fue generada electrónicamente y no requiere firma. Para mayor
              información visite www.{banco.id}.com.pe o acuda a cualquier agencia de{' '}
              {banco.name}.
            </li>
          </ol>
          <div className="bank-doc__footer-bar">
            <span>{banco.nombreCompleto} — RUC {banco.ruc}</span>
            <span>Documento generado el {formatearFecha(fechaEmision)}</span>
            <span>Ref: {numeroSimulacion}</span>
          </div>
        </footer>
      </article>
    </div>
  )
}
