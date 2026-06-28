export default function NumberInput({ label, value, onChange, min = 0, step = 1, suffix, hint }) {
  return (
    <div className="form-field">
      <label className="form-field__label">{label}</label>
      {hint && <span className="form-field__hint">{hint}</span>}
      <div className="form-field__input-wrap">
        <input
          type="number"
          className="form-field__input"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="form-field__suffix">{suffix}</span>}
      </div>
    </div>
  )
}
