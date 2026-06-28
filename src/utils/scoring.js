export const SCORE_RANGES = [
  { min: 800, max: 1000, label: 'Excelente', color: '#34D399', approve: true },
  { min: 650, max: 799, label: 'Bueno', color: '#8B5CF6', approve: true },
  { min: 500, max: 649, label: 'Regular', color: '#F59E0B', approve: false },
  { min: 300, max: 499, label: 'Bajo', color: '#F97316', approve: false },
  { min: 0, max: 299, label: 'Muy bajo', color: '#EF4444', approve: false },
]

export function getScoreRange(score) {
  return SCORE_RANGES.find(r => score >= r.min && score <= r.max) || SCORE_RANGES[4]
}

export function evaluateClient(client, params) {
  let score = 0
  const details = []

  // 1. Ratio deuda/ingreso (0-250 pts)
  const monthlyIncome = client.monthlyIncome || 0
  const currentDebts = client.currentDebts || 0
  const debtRatio = monthlyIncome > 0 ? currentDebts / monthlyIncome : 1
  if (debtRatio <= 0.1) { score += 250; details.push({ factor: 'Ratio deuda/ingreso', value: `${(debtRatio * 100).toFixed(1)}%`, points: 250, max: 250 }) }
  else if (debtRatio <= 0.25) { score += 200; details.push({ factor: 'Ratio deuda/ingreso', value: `${(debtRatio * 100).toFixed(1)}%`, points: 200, max: 250 }) }
  else if (debtRatio <= 0.4) { score += 140; details.push({ factor: 'Ratio deuda/ingreso', value: `${(debtRatio * 100).toFixed(1)}%`, points: 140, max: 250 }) }
  else if (debtRatio <= 0.6) { score += 80; details.push({ factor: 'Ratio deuda/ingreso', value: `${(debtRatio * 100).toFixed(1)}%`, points: 80, max: 250 }) }
  else { score += 20; details.push({ factor: 'Ratio deuda/ingreso', value: `${(debtRatio * 100).toFixed(1)}%`, points: 20, max: 250 }) }

  // 2. Estabilidad laboral (0-200 pts)
  const yearsEmployed = client.yearsEmployed || 0
  const empPoints = Math.min(200, yearsEmployed * 40)
  score += empPoints
  details.push({ factor: 'Estabilidad laboral', value: `${yearsEmployed} años`, points: empPoints, max: 200 })

  // 3. Tipo de empleo (0-150 pts)
  const empTypeScores = { formal: 150, independiente: 100, informal: 40, desempleado: 0 }
  const empPts = empTypeScores[client.employmentType] ?? 40
  score += empPts
  details.push({ factor: 'Tipo de empleo', value: client.employmentType || 'N/A', points: empPts, max: 150 })

  // 4. Historial crediticio (0-200 pts)
  const historyScores = { excelente: 200, bueno: 160, regular: 100, malo: 30, sin_historial: 60 }
  const histPts = historyScores[client.creditHistory] ?? 60
  score += histPts
  details.push({ factor: 'Historial crediticio', value: client.creditHistory?.replace('_', ' ') || 'N/A', points: histPts, max: 200 })

  // 5. Monto solicitado vs capacidad (0-200 pts)
  const requestedAmount = params.requestedAmount || 0
  const maxRecommended = monthlyIncome * 12 * 3
  const amountRatio = maxRecommended > 0 ? requestedAmount / maxRecommended : 1
  let amtPts = 0
  if (amountRatio <= 0.3) amtPts = 200
  else if (amountRatio <= 0.5) amtPts = 160
  else if (amountRatio <= 0.7) amtPts = 110
  else if (amountRatio <= 1) amtPts = 60
  else amtPts = 20
  score += amtPts
  details.push({ factor: 'Monto vs capacidad', value: `${(amountRatio * 100).toFixed(0)}%`, points: amtPts, max: 200 })

  score = Math.min(1000, Math.max(0, score))
  const range = getScoreRange(score)

  const monthlyPaymentEstimate = calculateMonthlyPayment(requestedAmount, params.annualRate || 15, params.termMonths || 12)
  const paymentToIncomeRatio = monthlyIncome > 0 ? monthlyPaymentEstimate / monthlyIncome : 1

  return {
    score,
    range,
    details,
    approved: range.approve && paymentToIncomeRatio <= 0.4,
    monthlyPaymentEstimate,
    paymentToIncomeRatio,
    maxRecommendedAmount: maxRecommended,
    requestedAmount,
    annualRate: params.annualRate || 15,
    termMonths: params.termMonths || 12,
  }
}

function calculateMonthlyPayment(principal, annualRate, months) {
  if (principal <= 0 || months <= 0) return 0
  const r = annualRate / 100 / 12
  if (r === 0) return principal / months
  return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
}

export function formatCurrency(n) {
  return 'S/ ' + Number(n || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatPct(n) {
  return Number(n || 0).toFixed(2) + '%'
}
