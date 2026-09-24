import type { Expert, PreBuiltBundle, SPOC } from './types'

export const EXPERTS: Expert[] = [
  // GUSTO ADVISORS - Available to all tiers
  {
    id: 'gusto-tax',
    name: 'Gusto Tax Advisor',
    title: 'Tax Planning & Quarterly Strategy',
    bio: 'Gusto tax specialists provide quarterly tax planning, estimated payment guidance, and deduction optimization. They track your payroll data to identify tax-saving opportunities year-round.',
    type: 'internal_expert',
    category: 'tax_strategy',
    monthlyFee: 0,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'gusto-benefits',
    name: 'Gusto Benefits Advisor',
    title: 'Benefits Setup & Employee Education',
    bio: 'Our benefits specialists help you design a competitive benefits package, navigate compliance, and provide employee education sessions to maximize your benefits investment.',
    type: 'internal_expert',
    category: 'hr_compliance',
    monthlyFee: 0,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'gusto-hrx',
    name: 'Gusto HR Partner',
    title: 'Strategic HR Consulting',
    bio: 'Gusto HR Partners provide strategic HR consulting, employee relations guidance, and performance management advice. They work with you on organizational development and workplace culture initiatives.',
    type: 'internal_expert',
    category: 'hr_compliance',
    monthlyFee: 99,
    scheduleFreeConsultation: false,
    priceDisplayLabel: '$99 per employee per month',
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  // AI AGENTS - Available on Simple tier
  {
    id: 'ai-workforce-strategy',
    name: 'Workforce Strategy Agent',
    title: 'Workforce Planning & Scenario Analysis',
    bio: 'Create and analyze workforce planning scenarios, forecast financial impacts, and execute approved changes with AI-powered insights backed by payroll data.',
    type: 'ai_agent',
    category: 'hr_compliance',
    monthlyFee: 0,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'ai-recruitment',
    name: 'Recruitment Agent',
    title: 'Frontline Applicant Screening',
    bio: 'Automatically screen frontline applicants through conversational interviews and real-time scoring, streamlining your hiring process.',
    type: 'ai_agent',
    category: 'hr_compliance',
    monthlyFee: 0,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'ai-wage-advisor',
    name: 'Wage Advisor Agent',
    title: 'Pay Rates & Compliance Guidance',
    bio: 'Get instant answers on pay rates, overtime rules, and wage compliance — powered by AI, backed by Gusto\'s expertise.',
    type: 'ai_agent',
    category: 'tax_strategy',
    monthlyFee: 0,
    availableInTiers: ['plus', 'premium'],
  },
  // Expert Marketplace Advisors
  {
    id: 'expert-accountant-bookkeeper',
    name: 'Accountant / Bookkeeper',
    title: 'Month-end Close & Reconciliations',
    bio: 'Month-end close, reconciliations, cashflow flags',
    type: 'external_expert',
    category: 'accounting',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'expert-tax-consultant-cpa',
    name: 'Tax Consultant / CPA',
    title: 'Multi-State Filings & Entity Structuring',
    bio: 'Multi-state filings, audits, entity structuring',
    type: 'external_expert',
    category: 'tax_strategy',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'expert-employment-attorney',
    name: 'Employment Attorney',
    title: 'Employment Law & Disputes',
    bio: 'Terminations, classification, disputes',
    type: 'external_expert',
    category: 'hr_compliance',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'expert-financial-advisor',
    name: 'Financial Advisor',
    title: 'Cash Flow Planning & Owner Comp',
    bio: 'Cash flow planning, owner comp',
    type: 'external_expert',
    category: 'tax_strategy',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'expert-insurance-broker',
    name: 'Insurance Broker',
    title: 'Benefits Plan Design & Workers Comp',
    bio: 'Workers\' comp, benefits plan design',
    type: 'external_expert',
    category: 'hr_compliance',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    availableInTiers: ['simple', 'plus', 'premium'],
  },
  {
    id: 'expert-immigration-consultant',
    name: 'Immigration Consultant',
    title: 'Visa Sponsorship & Global Hiring',
    bio: 'Visa sponsorship, global hiring',
    type: 'external_expert',
    category: 'hr_compliance',
    monthlyFee: 0,
    hourlyRate: 75,
    scheduleFreeConsultation: true,
    priceDisplayLabel: '$75 per hour',
    availableInTiers: ['simple', 'plus', 'premium'],
  },
]

export const PRE_BUILT_BUNDLES: PreBuiltBundle[] = [
  {
    id: 'bundle-simple',
    name: 'Recommended for you',
    description: 'Your plan includes free access to these advisors. Once you Add them to your team, you will find options to connect with them.',
    availableInTiers: ['simple'],
    experts: [
      EXPERTS.find(e => e.id === 'gusto-tax')!,
      EXPERTS.find(e => e.id === 'ai-recruitment')!,
    ],
    totalMonthlyFee: 0,
  },
  {
    id: 'bundle-plus',
    name: 'Recommended for you',
    description: 'Your plan includes free access to some advisors, while others come at a fee. Once you add advisors to your team, you will find options to connect with them. Charges will appear on your monthly invoice.',
    availableInTiers: ['plus'],
    experts: [
      EXPERTS.find(e => e.id === 'gusto-benefits')!,
      EXPERTS.find(e => e.id === 'gusto-hrx')!,
      EXPERTS.find(e => e.id === 'expert-accountant-bookkeeper')!,
    ],
    totalMonthlyFee: 99,
    customPriceLabel: '$99 per employee per month + $75 per hour',
  },
  {
    id: 'bundle-premium',
    name: 'Recommended for Premium',
    description: 'Your plan includes these advisors plus the option to add HRX specialist',
    availableInTiers: ['premium'],
    experts: [
      EXPERTS.find(e => e.id === 'gusto-tax')!,
      EXPERTS.find(e => e.id === 'gusto-benefits')!,
    ],
    totalMonthlyFee: 0,
  },
]

export const CATEGORY_LABELS: Record<string, string> = {
  bookkeeping: 'Bookkeeping',
  accounting: 'Accounting',
  marketing: 'Marketing',
  hr_compliance: 'HR & Compliance',
  tax_strategy: 'Tax Strategy',
}

export const EXPERT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  ai_agent: { label: 'AI Advisor', icon: '⚡' },
  internal_expert: { label: 'Internal Expert', icon: '👤' },
  external_expert: { label: 'External Expert', icon: '🎓' },
}

export const TIER_DESCRIPTIONS: Record<string, string> = {
  simple: 'AI-powered advisors for getting started',
  plus: 'AI + human experts for growing teams',
  premium: 'Full access to all experts — human & AI',
}

// Premium Tier SPOC (Single Point of Contact)
export const PREMIUM_SPOC: SPOC | null = {
  id: 'premium-spoc-001',
  name: 'Sarah Chen',
  title: 'Premium Account Partner',
  bio: 'Your dedicated payroll strategy expert. Sarah coordinates all your advisory needs and ensures seamless support across your business.',
  email: 'sarah.chen@gusto.com',
  phone: '(415) 555-0123',
}

// Seasonal specialist recommendations for Premium tier
// Maps month ranges to the most relevant specialist expert ID
export const SEASONAL_RECOMMENDATIONS: Record<string, string> = {
  '01': 'expert-tax-consultant-cpa', // Jan - Tax season prep
  '02': 'expert-tax-consultant-cpa', // Feb - Tax season
  '03': 'expert-tax-consultant-cpa', // Mar - Tax deadline prep
  '04': 'expert-financial-advisor', // Apr - Post-tax planning
  '05': 'expert-financial-advisor', // May - Financial planning
  '06': 'expert-insurance-broker', // Jun - Mid-year review
  '07': 'expert-insurance-broker', // Jul - Benefits review prep
  '08': 'expert-insurance-broker', // Aug - Open enrollment prep
  '09': 'expert-employment-attorney', // Sep - Compliance review
  '10': 'expert-employment-attorney', // Oct - Year-end planning
  '11': 'expert-accountant-bookkeeper', // Nov - Year-end close prep
  '12': 'expert-accountant-bookkeeper', // Dec - Year-end close
}

export function getSeasonalRecommendation(): string {
  const month = String(new Date().getMonth() + 1).padStart(2, '0')
  return SEASONAL_RECOMMENDATIONS[month] || 'expert-tax-consultant-cpa'
}
