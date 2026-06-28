export default function ResultCard({ title, value, subtitle, variant = 'default' }) {
  return (
    <div className={`result-card result-card--${variant}`}>
      <span className="result-card__title">{title}</span>
      <span className="result-card__value">{value}</span>
      {subtitle && <span className="result-card__subtitle">{subtitle}</span>}
    </div>
  )
}
