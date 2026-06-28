const COLORS = {
  capital: '#8B5CF6',
  intereses: '#34D399',
  cargos: '#A78BFA',
}

export default function DonutChart({ segments, size = 140 }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  if (total <= 0) return null

  const radius = 40
  const circumference = 2 * Math.PI * radius
  let offset = 0

  const slices = segments.map((seg) => {
    const pct = seg.value / total
    const dash = pct * circumference
    const slice = {
      ...seg,
      dash,
      offset,
      pct,
      color: COLORS[seg.id] || seg.color || '#888',
    }
    offset += dash
    return slice
  })

  return (
    <div className="donut-chart">
      <svg width={size} height={size} viewBox="0 0 100 100" className="donut-chart__svg">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" />
        {slices.map((slice) => (
          <circle
            key={slice.id}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth="12"
            strokeDasharray={`${slice.dash} ${circumference - slice.dash}`}
            strokeDashoffset={-slice.offset + circumference * 0.25}
            strokeLinecap="butt"
            className="donut-chart__slice"
          />
        ))}
        <text x="50" y="48" textAnchor="middle" className="donut-chart__center-label">
          {segments.length === 2 ? 'Costo' : 'Total'}
        </text>
        <text x="50" y="58" textAnchor="middle" className="donut-chart__center-sub">
          desglose
        </text>
      </svg>
      <ul className="donut-chart__legend">
        {slices.map((slice) => (
          <li key={slice.id} className="donut-chart__legend-item">
            <span className="donut-chart__dot" style={{ backgroundColor: slice.color }} />
            <span className="donut-chart__legend-label">{slice.label}</span>
            <span className="donut-chart__legend-value">{slice.pctLabel ?? `${(slice.pct * 100).toFixed(1)}%`}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
