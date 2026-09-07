import { describe, expect, it } from 'vitest'
import { parseLaunchRole } from './LaunchContext'

describe('Orderapp launch roles', () => {
  it('accepts CISapp Medical launches without changing them into Staff', () => {
    expect(parseLaunchRole('Medical')).toBe('medical')
    expect(parseLaunchRole(' medical ')).toBe('medical')
  })

  it('keeps existing customer and Staff launches case-insensitive', () => {
    expect(parseLaunchRole('customer')).toBe('customer')
    expect(parseLaunchRole('STAFF')).toBe('staff')
    expect(parseLaunchRole('admin')).toBeNull()
  })
})
