import { useContext } from 'react'
import { BaseContext } from './BaseContext'

export const useBase = () => {
  const context = useContext(BaseContext)
  if (!context) {
    throw new Error('useBase must be used within a BaseProvider')
  }
  return context
}
