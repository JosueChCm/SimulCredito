import { createContext, useContext, useState } from 'react'
import { banks, DEFAULT_BANK_ID } from '../data/banks'

const BankContext = createContext(null)

export function BankProvider({ children }) {
  const [selectedBankId, setSelectedBankId] = useState(DEFAULT_BANK_ID)

  const selectedBank = banks.find((b) => b.id === selectedBankId) ?? banks[0]

  return (
    <BankContext.Provider value={{ selectedBank, selectedBankId, setSelectedBankId, banks }}>
      {children}
    </BankContext.Provider>
  )
}

export function useBank() {
  const context = useContext(BankContext)
  if (!context) {
    throw new Error('useBank debe usarse dentro de BankProvider')
  }
  return context
}
