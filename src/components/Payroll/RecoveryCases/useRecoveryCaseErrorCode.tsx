import type { ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styles from './RecoveryCaseErrorCode.module.scss'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

export interface RecoveryCaseErrorCodeContent {
  title: string | null
  subtitle: string | null
  description: ReactNode[]
}

type ErrorCodeKey = 'R01' | 'R02' | 'R16' | 'R29' | 'bankError'

function getErrorCodeKey(errorCode: string | null | undefined): ErrorCodeKey {
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
  errorCode: string | null | undefined,
): RecoveryCaseErrorCodeContent {
  useI18n('Payroll.RecoveryCasesResubmit')
  const { t } = useTranslation('Payroll.RecoveryCasesResubmit')
  const { Text } = useComponentContext()

  if (!errorCode) {
    return {
      title: null,
      subtitle: null,
      description: [],
    }
  }

  const errorCodeKey = getErrorCodeKey(errorCode)

  const transComponents = {
    medium: <Text as="span" weight="medium" />,
  }

  const description: ReactNode[] = [
    <Text key="body">
      <Trans t={t} i18nKey={`errorCodes.${errorCodeKey}.body`} components={transComponents} />
    </Text>,
  ]

  if (errorCodeKey === 'R29') {
    const achCodes = Object.values(t('errorCodes.R29.achCodes', { returnObjects: true }))
    description.push(
      <Flex key="instruction" flexDirection="column" gap={16}>
        <Text>{t('errorCodes.R29.listDescription')}</Text>
        <ul className={styles.compactList}>
          {achCodes.map((code, index) => (
            <li key={index}>{code}</li>
          ))}
        </ul>
        <Text>
          <Trans t={t} i18nKey="errorCodes.R29.instruction" components={transComponents} />
        </Text>
      </Flex>,
    )
  } else {
    const instruction = t(`errorCodes.${errorCodeKey}.instruction`)
    if (instruction) {
      description.push(
        <Text key="instruction">
          <Trans
            t={t}
            i18nKey={`errorCodes.${errorCodeKey}.instruction`}
            components={transComponents}
          />
        </Text>,
      )
    }
  }

  return {
    title: t(`errorCodes.${errorCodeKey}.title`),
    subtitle: t(`errorCodes.${errorCodeKey}.subtitle`),
    description,
  }
}
