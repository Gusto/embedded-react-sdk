export interface BlockerMetadata {
  key: string
  title: string
  description: string
  helpText?: string
  severity: 'high' | 'medium' | 'low'
  category: 'company_setup' | 'employee_setup' | 'compliance' | 'technical' | 'approval'
  defaultAction?: string
}

// Severity mapping for each blocker type
const BLOCKER_SEVERITY_MAP: Record<string, 'high' | 'medium' | 'low'> = {
  geocode_error: 'medium',
  geocode_needed: 'medium',
  missing_signatory: 'high',
  invalid_signatory: 'high',
  suspended: 'high',
  needs_onboarding: 'high',
  missing_bank_info: 'high',
  missing_bank_verification: 'high',
  missing_employee_setup: 'high',
  missing_pay_schedule: 'high',
  pay_schedule_setup_not_complete: 'medium',
  missing_forms: 'medium',
  needs_approval: 'medium',
  pending_payroll_review: 'high',
  contractor_only_company: 'high',
}

// Category mapping for each blocker type
const BLOCKER_CATEGORY_MAP: Record<
  string,
  'company_setup' | 'employee_setup' | 'compliance' | 'technical' | 'approval'
> = {
  geocode_error: 'company_setup',
  geocode_needed: 'company_setup',
  missing_signatory: 'company_setup',
  invalid_signatory: 'compliance',
  suspended: 'compliance',
  needs_onboarding: 'company_setup',
  missing_bank_info: 'company_setup',
  missing_bank_verification: 'company_setup',
  missing_employee_setup: 'employee_setup',
  missing_pay_schedule: 'company_setup',
  pay_schedule_setup_not_complete: 'employee_setup',
  missing_forms: 'compliance',
  needs_approval: 'approval',
  pending_payroll_review: 'approval',
  contractor_only_company: 'company_setup',
}

/**
 * Get basic blocker metadata by key
 * Returns basic structure with fallback values - translations handled at component level
 */
export function getBlockerMetadata(key: string, fallbackMessage?: string): BlockerMetadata {
  return {
    key,
    title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    description: fallbackMessage || `Blocker: ${key}`,
    severity: BLOCKER_SEVERITY_MAP[key] || 'medium',
    category: BLOCKER_CATEGORY_MAP[key] || 'technical',
  }
}

/**
 * Get translation keys for a blocker - use these in components with useTranslation
 */
export function getBlockerTranslationKeys(key: string) {
  return {
    titleKey: `PayrollBlocker:blockers.${key}.title`,
    descriptionKey: `PayrollBlocker:blockers.${key}.description`,
    helpTextKey: `PayrollBlocker:blockers.${key}.helpText`,
    defaultActionKey: `PayrollBlocker:blockers.${key}.defaultAction`,
  }
}

/**
 * Get all known blocker keys
 */
export const KNOWN_BLOCKER_KEYS = Object.keys(BLOCKER_SEVERITY_MAP)
