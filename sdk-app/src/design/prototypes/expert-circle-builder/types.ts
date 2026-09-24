export type Tier = 'simple' | 'plus' | 'premium'
export type ExpertType = 'ai_agent' | 'internal_expert' | 'external_expert'
export type Category = 'bookkeeping' | 'accounting' | 'marketing' | 'hr_compliance' | 'tax_strategy'

export interface Expert {
  id: string
  name: string
  title: string
  bio: string
  type: ExpertType
  category: Category
  monthlyFee: number
  hourlyRate?: number
  scheduleFreeConsultation?: boolean
  priceDisplayLabel?: string
  availableInTiers: Tier[]
}

export interface PreBuiltBundle {
  id: string
  name: string
  description: string
  availableInTiers: Tier[]
  experts: Expert[]
  totalMonthlyFee: number
  customPriceLabel?: string
}

export interface CartItem extends Expert {
  addedAt: number
}

export interface SPOC {
  id: string
  name: string
  title: string
  bio: string
  email?: string
  phone?: string
  photo?: string
}
