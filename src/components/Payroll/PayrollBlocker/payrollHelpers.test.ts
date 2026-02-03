import { describe, it, expect } from 'vitest'
import { getBlockerTranslationKeys } from './payrollHelpers'

describe('PayrollBlocker Translation Key Validation', () => {
  describe('getBlockerTranslationKeys', () => {
    it('generates correct translation keys without namespace prefix', () => {
      const keys = getBlockerTranslationKeys('pending_recovery_case')

      expect(keys.titleKey).toBe('blockers.pending_recovery_case.title')
      expect(keys.descriptionKey).toBe('blockers.pending_recovery_case.description')
      expect(keys.helpTextKey).toBe('blockers.pending_recovery_case.help')
      expect(keys.defaultActionKey).toBe('blockers.pending_recovery_case.defaultAction')
    })

    it('does not include namespace prefix in keys', () => {
      const keys = getBlockerTranslationKeys('any_blocker')

      expect(keys.titleKey).not.toContain('PayrollBlocker:')
      expect(keys.descriptionKey).not.toContain('PayrollBlocker:')
      expect(keys.helpTextKey).not.toContain('PayrollBlocker:')
      expect(keys.defaultActionKey).not.toContain('PayrollBlocker:')
    })

    it('generates keys for all critical blocker types', () => {
      const criticalBlockers = [
        'pending_recovery_case',
        'pending_information_request',
        'missing_signatory',
        'missing_bank_info',
        'suspended',
        'needs_onboarding',
      ]

      criticalBlockers.forEach(blockerKey => {
        const keys = getBlockerTranslationKeys(blockerKey)

        expect(keys.titleKey).toBe(`blockers.${blockerKey}.title`)
        expect(keys.descriptionKey).toBe(`blockers.${blockerKey}.description`)
      })
    })
  })

  describe('Translation file structure validation', () => {
    it('validates translation file has expected structure', async () => {
      const translations = await import('@/i18n/en/Payroll.PayrollBlocker.json')

      expect(translations.blockers).toBeDefined()
      expect(typeof translations.blockers).toBe('object')
      expect(translations.defaultBlockerDescription).toBeDefined()
      expect(translations.defaultBlockerHelp).toBeDefined()
    })

    it('validates critical blocker translations exist', async () => {
      const translations = await import('@/i18n/en/Payroll.PayrollBlocker.json')

      const criticalBlockers = [
        'pending_recovery_case',
        'pending_information_request',
        'missing_signatory',
        'missing_bank_info',
      ] as const

      criticalBlockers.forEach(blockerKey => {
        const blocker = translations.blockers[blockerKey as keyof typeof translations.blockers]
        expect(blocker).toBeDefined()
        expect(blocker.title).toBeDefined()
        expect(blocker.description).toBeDefined()
        expect(typeof blocker.title).toBe('string')
        expect(typeof blocker.description).toBe('string')
      })
    })

    it('validates pending_recovery_case translation matches design', async () => {
      const translations = await import('@/i18n/en/Payroll.PayrollBlocker.json')

      const blocker = translations.blockers.pending_recovery_case

      expect(blocker.title).toBe('Recovery case pending')
      expect(blocker.description).toBe(
        'You have unresolved recovery cases. Resolve them to unblock your account.',
      )
    })

    it('validates pending_information_request translation matches design', async () => {
      const translations = await import('@/i18n/en/Payroll.PayrollBlocker.json')

      const blocker = translations.blockers.pending_information_request

      expect(blocker.title).toBe('Request for information pending')
      expect(blocker.description).toBe(
        'You have outstanding requests for information. Respond to unblock payroll.',
      )
    })
  })
})
