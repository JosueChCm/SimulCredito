import { useBank } from '../context/BankContext'

export default function BankSelector() {
  const { selectedBankId, setSelectedBankId, banks, selectedBank } = useBank()

  return (
    <div className="bank-selector">
      <label htmlFor="bank-select">
        <span className="bank-selector__label">Entidad financiera</span>
        <span className="bank-selector__hint">
          Esta selección aplica a todos los cálculos de la aplicación
        </span>
      </label>
      <select
        id="bank-select"
        value={selectedBankId}
        onChange={(e) => setSelectedBankId(e.target.value)}
        className="bank-selector__select"
      >
        {banks.map((bank) => (
          <option key={bank.id} value={bank.id}>
            {bank.name}
          </option>
        ))}
      </select>
      <div className="bank-selector__info">
        <span>Tasa nominal: {(selectedBank.tasaNominalAnual * 100).toFixed(2)}% anual</span>
        <span>Ratio cuota/ingreso: {(selectedBank.ratioCuotaIngreso * 100).toFixed(0)}%</span>
      </div>
    </div>
  )
}
