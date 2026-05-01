import { Trans, useTranslation } from 'react-i18next'
import { usePaySchedulesGetAllSuspense } from '@gusto/embedded-api/react-query/paySchedulesGetAll'
import styles from './PayScheduleList.module.scss'
import { useDataView, DataView, Flex, VisuallyHidden, ActionsLayout } from '@/components/Common'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { HamburgerMenu } from '@/components/Common/HamburgerMenu'
import { componentEvents, type EventType } from '@/shared/constants'
import type { OnEventType } from '@/components/Base/useBase'

interface PayScheduleListProps {
  companyId: string
  onEvent: OnEventType<EventType, unknown>
}

export function PayScheduleList({ companyId, onEvent }: PayScheduleListProps) {
  const { t } = useTranslation('Company.PaySchedule')
  const Components = useComponentContext()

  const { data: paySchedules } = usePaySchedulesGetAllSuspense({ companyId })

  const dataViewProps = useDataView({
    data: paySchedules.paySchedules || [],
    columns: [
      {
        title: t('payScheduleList.name'),
        key: 'customName',
        render: schedule => {
          const hasName = !!schedule.name
          let displayName = hasName ? schedule.name : schedule.customName
          if (displayName && displayName.length > 1) {
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1)
          } else {
            displayName = schedule.customName
          }
          const displayFrequency = schedule.customName
          return (
            <Flex flexDirection="column" gap={0}>
              <div className={styles.content}>
                <div>{displayName}</div>
                {hasName && <div>{displayFrequency}</div>}
              </div>
            </Flex>
          )
        },
      },
      {
        title: <VisuallyHidden>{t('payScheduleList.active')}</VisuallyHidden>,
        key: 'active',
        render: schedule => (
          <Flex alignItems="center" justifyContent="center">
            <div className={styles.content}>
              {schedule.active ? (
                <Components.Badge status="success">{t('payScheduleList.active')}</Components.Badge>
              ) : (
                <Components.Badge status="info">{t('payScheduleList.inactive')}</Components.Badge>
              )}
            </div>
          </Flex>
        ),
      },
    ],
    itemMenu: schedule => (
      <HamburgerMenu
        triggerLabel="Actions"
        items={[
          {
            label: t('payScheduleList.edit'),
            onClick: () => {
              onEvent(componentEvents.PAY_SCHEDULE_UPDATE, { uuid: schedule.uuid })
            },
            icon: <PencilSvg aria-hidden />,
          },
        ]}
      />
    ),
  })

  return (
    <Flex flexDirection="column" gap={32}>
      <Flex justifyContent="space-between" flexDirection="column" gap={4} alignItems="stretch">
        <header>
          <Flex flexDirection="column" gap={4}>
            <Components.Heading as="h2">{t('headings.pageTitle')}</Components.Heading>
            <Components.Text variant="supporting">
              <Trans
                i18nKey="listDescription"
                t={t}
                components={{ ScheduleLink: <Components.Link /> }}
              />
            </Components.Text>
            <Components.Text variant="supporting">
              <Trans
                i18nKey="listDescription2"
                t={t}
                components={{ PaymentLawLink: <Components.Link /> }}
              />
            </Components.Text>
          </Flex>
        </header>
      </Flex>
      <DataView label="test" {...dataViewProps} />
      <ActionsLayout>
        <Components.Button
          variant="secondary"
          onClick={() => {
            onEvent(componentEvents.PAY_SCHEDULE_CREATE)
          }}
        >
          {t('addAnotherPayScheduleCta')}
        </Components.Button>
        <Components.Button
          variant="primary"
          onClick={() => {
            onEvent(componentEvents.PAY_SCHEDULE_DONE)
          }}
        >
          {t('continueCta')}
        </Components.Button>
      </ActionsLayout>
    </Flex>
  )
}
