/**
 * Motor de cálculo financiero compartido por todas las secciones.
 */

/** Convierte tasa nominal anual a tasa efectiva mensual */
export function tasaAnualAMensual(tasaAnual) {
  return Math.pow(1 + tasaAnual, 1 / 12) - 1
}

/** Cuota fija del sistema francés */
export function calcularCuotaFrancesa(monto, tasaMensual, plazoMeses) {
  if (plazoMeses <= 0 || monto <= 0) return 0
  if (tasaMensual === 0) return monto / plazoMeses
  const factor = Math.pow(1 + tasaMensual, plazoMeses)
  return (monto * tasaMensual * factor) / (factor - 1)
}

/** Monto máximo de préstamo dado una cuota máxima (inverso del sistema francés) */
export function calcularMontoMaximo(cuotaMaxima, tasaMensual, plazoMeses) {
  if (cuotaMaxima <= 0 || plazoMeses <= 0) return 0
  if (tasaMensual === 0) return cuotaMaxima * plazoMeses
  const factor = Math.pow(1 + tasaMensual, plazoMeses)
  return (cuotaMaxima * (factor - 1)) / (tasaMensual * factor)
}

/** Genera cronograma completo con intereses, seguro, ITF y saldo */
export function generarCronograma(monto, plazoMeses, banco) {
  const tasaMensual = tasaAnualAMensual(banco.tasaNominalAnual)
  const cuotaCapital = calcularCuotaFrancesa(monto, tasaMensual, plazoMeses)

  let saldo = monto
  const filas = []
  let totalIntereses = 0
  let totalSeguro = 0
  let totalItf = 0
  let totalPagado = 0

  for (let periodo = 1; periodo <= plazoMeses; periodo++) {
    const interes = saldo * tasaMensual
    const amortizacion = cuotaCapital - interes
    const seguro = saldo * banco.seguroDesgravamen
    const itf = cuotaCapital * banco.itf
    const cuotaTotal = cuotaCapital + seguro + itf

    saldo = Math.max(0, saldo - amortizacion)

    totalIntereses += interes
    totalSeguro += seguro
    totalItf += itf
    totalPagado += cuotaTotal

    filas.push({
      periodo,
      cuota: cuotaTotal,
      cuotaCapital,
      interes,
      seguro,
      itf,
      amortizacion,
      saldo,
    })
  }

  return {
    filas,
    resumen: {
      cuotaMensual: filas[0]?.cuota ?? 0,
      cuotaCapital,
      totalIntereses,
      totalSeguro,
      totalItf,
      totalPagado,
      monto,
      plazoMeses,
    },
  }
}

/** Calcula TIR (IRR) mediante método de bisección */
export function calcularTIR(flujos, precision = 1e-8, maxIter = 200) {
  if (!flujos.length || flujos[0] >= 0) return 0

  let min = -0.9999
  let max = 10

  const npv = (rate) =>
    flujos.reduce((acc, flujo, i) => acc + flujo / Math.pow(1 + rate, i), 0)

  if (npv(min) * npv(max) > 0) return 0

  for (let i = 0; i < maxIter; i++) {
    const mid = (min + max) / 2
    const valor = npv(mid)
    if (Math.abs(valor) < precision) return mid
    if (valor * npv(min) > 0) min = mid
    else max = mid
  }

  return (min + max) / 2
}

/** TCEA a partir del cronograma de pagos */
export function calcularTCEA(monto, cronograma) {
  const flujos = [-monto, ...cronograma.filas.map((f) => f.cuota)]
  const tirMensual = calcularTIR(flujos)
  return Math.pow(1 + tirMensual, 12) - 1
}

/** Evalúa capacidad de endeudamiento */
export function evaluarCapacidadEndeudamiento(ingresos, deudasActuales, banco, plazoMeses) {
  const cuotaMaxima = Math.max(0, ingresos * banco.ratioCuotaIngreso - deudasActuales)
  const tasaMensual = tasaAnualAMensual(banco.tasaNominalAnual)
  const montoMaximo = calcularMontoMaximo(cuotaMaxima, tasaMensual, plazoMeses)

  let cronograma = null
  let tcea = 0

  if (montoMaximo > 0) {
    cronograma = generarCronograma(montoMaximo, plazoMeses, banco)
    tcea = calcularTCEA(montoMaximo, cronograma)
  }

  return {
    cuotaMaxima,
    montoMaximo,
    ratioUtilizado: banco.ratioCuotaIngreso,
    cronograma,
    tcea,
    plazoMeses,
  }
}

/** Calcula tasa implícita de compra a plazos en tienda */
export function calcularCostoCompraPlazos(precioContado, numCuotas, cuotaMensual, cuotaInicial = 0) {
  const flujos = [precioContado - cuotaInicial]
  for (let i = 0; i < numCuotas; i++) {
    flujos.push(-cuotaMensual)
  }

  const tirMensual = calcularTIR(flujos.map((f) => -f))
  const tcea = Math.pow(1 + tirMensual, 12) - 1
  const totalPagado = cuotaInicial + cuotaMensual * numCuotas
  const costoOculto = totalPagado - precioContado

  return { tcea, tirMensual, totalPagado, costoOculto }
}

/** Compara compra a plazos en tienda vs crédito bancario */
export function compararFinanciamientoCompra(precioContado, numCuotas, cuotaMensual, cuotaInicial, banco) {
  const tienda = calcularCostoCompraPlazos(precioContado, numCuotas, cuotaMensual, cuotaInicial)

  const montoCredito = precioContado - cuotaInicial
  const cronogramaBanco = generarCronograma(montoCredito, numCuotas, banco)
  const tceaBanco = calcularTCEA(montoCredito, cronogramaBanco)
  const totalBanco = cronogramaBanco.resumen.totalPagado + cuotaInicial

  const ahorro = tienda.totalPagado - totalBanco
  const opcionRecomendada = totalBanco <= tienda.totalPagado ? 'banco' : 'tienda'

  return {
    tienda,
    banco: {
      tcea: tceaBanco,
      totalPagado: totalBanco,
      cronograma: cronogramaBanco,
      cuotaMensual: cronogramaBanco.resumen.cuotaMensual,
    },
    ahorro: Math.abs(ahorro),
    opcionRecomendada,
  }
}

/** Simula financiamiento empresarial: préstamo, leasing y capital propio */
export function simularFinanciamientoEmpresarial({
  valorActivo,
  plazoMeses,
  banco,
  valorResidualPct = 0.1,
  tasaOportunidad = null,
}) {
  const tasaMensual = tasaAnualAMensual(banco.tasaNominalAnual)
  const tasaLeasingMensual = tasaAnualAMensual(banco.tasaLeasing)
  const tasaOport = tasaOportunidad ?? banco.tasaDeposito

  // Opción 1: Préstamo bancario
  const cronogramaPrestamo = generarCronograma(valorActivo, plazoMeses, banco)
  const tceaPrestamo = calcularTCEA(valorActivo, cronogramaPrestamo)

  let ahorroFiscalPrestamo = 0
  cronogramaPrestamo.filas.forEach((f) => {
    ahorroFiscalPrestamo += f.interes * 0.295
  })
  const costoNetoPrestamo = cronogramaPrestamo.resumen.totalPagado - ahorroFiscalPrestamo

  // Opción 2: Leasing
  const valorResidual = valorActivo * valorResidualPct
  const montoLeasing = valorActivo - valorResidual
  const cuotaLeasing = calcularCuotaFrancesa(montoLeasing, tasaLeasingMensual, plazoMeses)

  let totalCuotasLeasing = 0
  let ahorroFiscalLeasing = 0
  const depreciacionMensual = valorActivo / plazoMeses
  const recuperacionIGV = valorActivo * (0.18 / 1.18)

  for (let i = 0; i < plazoMeses; i++) {
    totalCuotasLeasing += cuotaLeasing
    ahorroFiscalLeasing += depreciacionMensual * 0.295
  }

  const costoNetoLeasing = totalCuotasLeasing + valorResidual - recuperacionIGV - ahorroFiscalLeasing

  // Opción 3: Capital propio (costo de oportunidad)
  const costoOportunidadTotal =
    valorActivo * Math.pow(1 + tasaOport, plazoMeses / 12) - valorActivo
  const costoNetoCapital = costoOportunidadTotal

  const opciones = [
    { id: 'prestamo', nombre: 'Préstamo bancario', costoNeto: costoNetoPrestamo, tcea: tceaPrestamo },
    { id: 'leasing', nombre: 'Leasing financiero', costoNeto: costoNetoLeasing, tcea: null },
    { id: 'capital', nombre: 'Capital propio', costoNeto: costoNetoCapital, tcea: tasaOport },
  ]

  opciones.sort((a, b) => a.costoNeto - b.costoNeto)

  return {
    prestamo: {
      cronograma: cronogramaPrestamo,
      tcea: tceaPrestamo,
      totalPagado: cronogramaPrestamo.resumen.totalPagado,
      ahorroFiscal: ahorroFiscalPrestamo,
      costoNeto: costoNetoPrestamo,
    },
    leasing: {
      cuotaMensual: cuotaLeasing,
      totalCuotas: totalCuotasLeasing,
      valorResidual,
      recuperacionIGV,
      ahorroFiscal: ahorroFiscalLeasing,
      costoNeto: costoNetoLeasing,
    },
    capital: {
      tasaOportunidad: tasaOport,
      costoOportunidad: costoOportunidadTotal,
      costoNeto: costoNetoCapital,
    },
    mejorOpcion: opciones[0],
    opciones,
  }
}

/** Formatea número como moneda peruana */
export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(valor ?? 0)
}

/** Formatea número como porcentaje */
export function formatearPorcentaje(valor, decimales = 2) {
  return `${((valor ?? 0) * 100).toFixed(decimales)}%`
}

/** Calcula TEA a partir de tasa nominal anual */
export function calcularTEA(tasaNominalAnual) {
  return Math.pow(1 + tasaNominalAnual, 1) - 1
}

/** Formatea fecha en español peruano */
export function formatearFecha(fecha = new Date()) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(fecha)
}

/** Formatea fecha corta DD/MM/YYYY */
export function formatearFechaCorta(fecha) {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha)
}

/** Genera número de referencia único para simulación */
export function generarNumeroSimulacion(bancoId) {
  const prefijo = bancoId.toUpperCase().slice(0, 3)
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.floor(Math.random() * 9000 + 1000)
  return `SIM-${prefijo}-${timestamp}-${random}`
}

/** Calcula fecha del primer pago (30 días desde hoy) */
export function calcularFechaPrimerPago(fechaBase = new Date()) {
  const fecha = new Date(fechaBase)
  fecha.setMonth(fecha.getMonth() + 1)
  return fecha
}

/** Calcula fecha de un pago según periodo */
export function calcularFechaPago(fechaPrimerPago, periodo) {
  const fecha = new Date(fechaPrimerPago)
  fecha.setMonth(fecha.getMonth() + periodo - 1)
  return fecha
}
