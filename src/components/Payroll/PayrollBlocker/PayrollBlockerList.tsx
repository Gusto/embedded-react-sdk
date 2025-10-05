import { useTranslation } from 'react-i18next'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { Flex, FlexItem } from '@/components/Common'
import { DataView } from '@/components/Common/DataView/DataView'
import { useDataView } from '@/components/Common/DataView/useDataView'
import { useI18n } from '@/i18n'

export interface PayrollBlocker {
  id: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface PayrollBlockerListProps {
  blockers: PayrollBlocker[]
  className?: string
}

/**
 * PayrollBlockerList - DataView-based component displaying payroll blockers
 * Shows each blocker with individual resolution buttons
 */
export function PayrollBlockerList({ blockers, className }: PayrollBlockerListProps) {
  useI18n('PayrollBlocker')
  const { t } = useTranslation('PayrollBlocker')
  const { Button, Text, Heading } = useComponentContext()

  const dataViewProps = useDataView({
    data: blockers,
    columns: [
      {
        title: t('blockerSectionLabel'),
        render: blocker => (
          <FlexItem flexGrow={1}>
            <Flex flexDirection="column" gap={8}>
              <Text weight="semibold">{blocker.title}</Text>
              <Text variant="supporting">{blocker.description}</Text>
            </Flex>
          </FlexItem>
        ),
      },
      {
        title: '',
        render: blocker => {
          // For presentational purposes, just show the primary action if it exists
          const action = blocker.action

          if (!action) {
            return null
          }

          return (
            <Flex justifyContent="flex-end" alignItems="center">
              <Button variant="secondary" onClick={action.onClick} title={action.label}>
                {action.label}
              </Button>
            </Flex>
          )
        },
      },
    ],
  })

  if (blockers.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <Flex flexDirection="column" gap={24}>
        <Heading as="h2" styledAs="h4">
          {t('blockersListTitle')}
        </Heading>

        <DataView {...dataViewProps} label={t('blockersListTitle')} />
      </Flex>
    </div>
  )
}
