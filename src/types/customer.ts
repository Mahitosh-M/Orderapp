export type UserRole = 'customer' | 'staff'

export interface CustomerProfile {
  uid: string
  customerCode: string
  businessName: string
  ownerName: string
  mobile: string
  email: string
  address: string
  active: boolean
  role: UserRole
  createdAt: string
  updatedAt: string
}
