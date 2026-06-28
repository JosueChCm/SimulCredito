import { getScoreRange } from '../utils/scoring'

export default function ScoreGauge({ score, size = 160 }) {
  const range = getScoreRange(score)
  const pct = score / 1000
  const radius = 62
  const circumference = Math.PI * radius
  const dashLen = pct * circumference

  return (
    <div className="score-gauge">
      <svg width={size} height={size * 0.6} viewBox="0 0 160 96">
        <path
          d="M 16 80 A 62 62 0 0 1 144 80"
          fill="none"
          stroke="rgba(139,92,246,0.12)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 16 80 A 62 62 0 0 1 144 80"
          fill="none"
          stroke={range.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dashLen} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="80" y="68" textAnchor="middle" fill={range.color} fontSize="28" fontWeight="700" fontFamily="'Space Grotesk', sans-serif">
          {score}
        </text>
        <text x="80" y="88" textAnchor="middle" fill="#6868A0" fontSize="11" fontFamily="'Space Grotesk', sans-serif" letterSpacing="0.05em">
          {range.label}
        </text>
      </svg>
    </div>
  )
}
