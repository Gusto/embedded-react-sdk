import { VisuallyHidden } from 'react-aria'
import { useTranslation } from 'react-i18next'
import { usePaySchedule } from '../usePaySchedule'
import { useDataView, DataView, Flex } from '@/components/Common'
import PencilSvg from '@/assets/icons/pencil.svg?react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export const List = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const Components = useComponentContext()
  const { paySchedules, mode, handleEdit } = usePaySchedule()

  const { ...dataViewProps } = useDataView({
    data: paySchedules || [],
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
            <Flex flexDirection={'column'} gap={0}>
              <div>{displayName}</div>
              {hasName && <div>{displayFrequency}</div>}
            </Flex>
          )
        },
      },
      {
        title: <VisuallyHidden>{t('payScheduleList.active')}</VisuallyHidden>,
        key: 'active',
        render: schedule => (
          <Flex alignItems={'center'} justifyContent={'center'}>
            {schedule.active ? (
              <Components.Badge status="success">{t('payScheduleList.active')}</Components.Badge>
            ) : (
              <Components.Badge status="info">{t('payScheduleList.inactive')}</Components.Badge>
            )}
          </Flex>
        ),
      },
      {
        title: <VisuallyHidden>{t('payScheduleList.actions')}</VisuallyHidden>,
        key: 'actions',
        render: schedule => {
          return (
            <Components.HamburgerMenu
              triggerLabel="Actions"
              items={[
                {
                  label: t('payScheduleList.edit'),
                  onClick: () => {
                    handleEdit(schedule)
                  },
                  icon: <PencilSvg aria-hidden />,
                },
              ]}
            />
          )
        },
      },
    ],
  })

  if (mode !== 'LIST_PAY_SCHEDULES') {
    return null
  }

  return <DataView label="test" {...dataViewProps} />
}
