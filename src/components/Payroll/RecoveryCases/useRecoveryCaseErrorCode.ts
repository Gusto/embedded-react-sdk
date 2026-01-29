import { useTranslation } from 'react-i18next'
import { useI18n } from '@/i18n'

export interface RecoveryCaseErrorCodeContent {
  title: string
  subtitle: string
  body: string
  instruction: string
}

type ErrorCodeKey = 'R01' | 'R02' | 'R16' | 'R29' | 'bankError'

export function useRecoveryCaseErrorCode(
  errorCode: string | undefined,
): RecoveryCaseErrorCodeContent {
  useI18n('Payroll.RecoveryCasesResubmit')
  const { t } = useTranslation('Payroll.RecoveryCasesResubmit')

  const getErrorCodeKey = (code: string | undefined): ErrorCodeKey => {
    switch (code) {
      case 'R01':
        return 'R01'
      case 'R02':
        return 'R02'
      case 'R16':
        return 'R16'
      case 'R29':
        return 'R29'
      default:
        return 'bankError'
    }
  }

  const errorCodeKey = getErrorCodeKey(errorCode)

  return {
    title: t(`errorCodes.${errorCodeKey}.title` as const),
    subtitle: t(`errorCodes.${errorCodeKey}.subtitle` as const),
    body: t(`errorCodes.${errorCodeKey}.body` as const),
    instruction: t(`errorCodes.${errorCodeKey}.instruction` as const),
  }
}
