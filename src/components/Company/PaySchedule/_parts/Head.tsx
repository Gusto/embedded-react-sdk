import { Trans, useTranslation } from 'react-i18next'
import { usePaySchedule } from '../usePaySchedule'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

// Head slot for PaySchedule component
export const Head = () => {
  const { t } = useTranslation('Company.PaySchedule')
  const Components = useComponentContext()

  const { mode } = usePaySchedule()
  let headingOutput: React.ReactElement = <></>

  switch (mode) {
    case 'LIST_PAY_SCHEDULES':
      headingOutput = (
        <>
          <Components.Heading as="h2">{t('headings.pageTitle')}</Components.Heading>
          <Components.Text as="p">
            <Trans
              i18nKey={'listDescription'}
              t={t}
              components={{
                how_to_choose_schedule: <Components.Link />,
              }}
            />
          </Components.Text>
          <Components.Text as="p">
            <Trans
              i18nKey={'listDescription2'}
              t={t}
              components={{
                payment_law_doc: <Components.Link />,
              }}
            />
          </Components.Text>
        </>
      )
      break
    case 'ADD_PAY_SCHEDULE':
      headingOutput = (
        <Components.Heading as="h2">{t('headings.addPaySchedule')}</Components.Heading>
      )
      break
    case 'EDIT_PAY_SCHEDULE':
      headingOutput = (
        <Components.Heading as="h2">{t('headings.editPaySchedule')}</Components.Heading>
      )
      break
    default:
  }

  return (
    <Flex justifyContent="space-between" flexDirection={'column'} gap={4}>
      <header>{headingOutput}</header>
    </Flex>
  )
}
