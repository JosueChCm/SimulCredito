import { createContext, useContext, useState, useEffect } from 'react'
import { load, save, genId } from '../utils/storage'
import { useAuth } from './AuthContext'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [clients, setClients] = useState([])
  const [evaluations, setEvaluations] = useState([])

  useEffect(() => {
    setClients(load('clients', []))
    setEvaluations(load('evaluations', []))
  }, [])

  function persist(key, data) {
    save(key, data)
  }

  function addClient(data) {
    const client = { ...data, id: genId(), createdBy: user?.id, createdAt: new Date().toISOString() }
    const next = [...clients, client]
    setClients(next)
    persist('clients', next)
    return client
  }

  function updateClient(id, data) {
    const next = clients.map(c => c.id === id ? { ...c, ...data } : c)
    setClients(next)
    persist('clients', next)
  }

  function deleteClient(id) {
    const next = clients.filter(c => c.id !== id)
    setClients(next)
    persist('clients', next)
    const nextEvals = evaluations.filter(e => e.clientId !== id)
    setEvaluations(nextEvals)
    persist('evaluations', nextEvals)
  }

  function addEvaluation(data) {
    const evaluation = { ...data, id: genId(), analystId: user?.id, analystName: user?.name, createdAt: new Date().toISOString() }
    const next = [...evaluations, evaluation]
    setEvaluations(next)
    persist('evaluations', next)
    return evaluation
  }

  function getClientEvaluations(clientId) {
    return evaluations.filter(e => e.clientId === clientId)
  }

  function getMyClients() {
    if (user?.role === 'admin') return clients
    return clients.filter(c => c.createdBy === user?.id)
  }

  function getMyEvaluations() {
    if (user?.role === 'admin') return evaluations
    return evaluations.filter(e => e.analystId === user?.id)
  }

  return (
    <AppContext.Provider value={{
      clients, evaluations,
      addClient, updateClient, deleteClient,
      addEvaluation, getClientEvaluations,
      getMyClients, getMyEvaluations,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
