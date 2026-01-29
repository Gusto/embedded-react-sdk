import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export interface RecoveryCaseErrorCodeContent {
  title: string
  subtitle: string
  body: ReactNode
  instruction: ReactNode | null
}

type ErrorCodeKey = 'R01' | 'R02' | 'R16' | 'R29' | 'bankError'

function getErrorCodeKey(errorCode: string | undefined): ErrorCodeKey {
  switch (errorCode) {
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

export function useRecoveryCaseErrorCode(
  errorCode: string | undefined,
): RecoveryCaseErrorCodeContent {
  useI18n('Payroll.RecoveryCasesResubmit')
  const { t } = useTranslation('Payroll.RecoveryCasesResubmit')
  const { Text } = useComponentContext()

  const errorCodeKey = getErrorCodeKey(errorCode)
  const instructionKey = `errorCodes.${errorCodeKey}.instruction` as const
  const hasInstruction = t(instructionKey) !== ''

  const transComponents = {
    medium: <Text as="span" weight="medium" />,
  }

  return {
    title: t(`errorCodes.${errorCodeKey}.title`),
    subtitle: t(`errorCodes.${errorCodeKey}.subtitle`),
    body: <Trans t={t} i18nKey={`errorCodes.${errorCodeKey}.body`} components={transComponents} />,
    instruction: hasInstruction ? (
      <Trans t={t} i18nKey={instructionKey} components={transComponents} />
    ) : null,
  }
}
