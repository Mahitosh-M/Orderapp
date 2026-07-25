import { useContext } from 'react'
import { LaunchContext } from '../context/LaunchContext'

export function useLaunch() {
  const value = useContext(LaunchContext)
  if (!value) throw new Error('useLaunch must be used inside LaunchProvider')
  return value
}
