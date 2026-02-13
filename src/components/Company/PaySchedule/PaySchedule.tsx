import { FormProvider } from 'react-hook-form'
import { useCompanyPaySchedule } from './useCompanyPaySchedule'
import { PayScheduleProvider, type PayScheduleDefaultValues } from './usePaySchedule'
import { Actions, Edit, Head, List } from './_parts'
import { Form } from '@/components/Common/Form'
import type { BaseComponentInterface, CommonComponentInterface } from '@/components/Base'
import { BaseComponent } from '@/components/Base'
import { Flex } from '@/components/Common'
import { useI18n } from '@/i18n'
import { useComponentDictionary } from '@/i18n/I18n'

interface PayScheduleProps extends CommonComponentInterface<'Company.PaySchedule'> {
  companyId: string
  defaultValues?: PayScheduleDefaultValues
}

export const PaySchedule = ({
  companyId,
  defaultValues,
  dictionary,
  ...props
}: PayScheduleProps & BaseComponentInterface) => {
  useI18n('Company.PaySchedule')
  useComponentDictionary('Company.PaySchedule', dictionary)
  return (
    <BaseComponent {...props}>
      <Root companyId={companyId} defaultValues={defaultValues}>
        {props.children}
      </Root>
    </BaseComponent>
  )
}

const Root = ({ companyId, children, defaultValues }: PayScheduleProps) => {
  const {
    data: { paySchedules, payPeriodPreview, currentPaySchedule },
    actions: { handleAdd, handleEdit, handleCancel, handleContinue, onSubmit },
    meta: { mode, payPreviewLoading },
    form: { formMethods },
  } = useCompanyPaySchedule({ companyId, defaultValues })

  return (
    <PayScheduleProvider
      value={{
        companyId,
        handleAdd,
        handleEdit,
        handleCancel,
        handleContinue,
        mode,
        paySchedules,
        payPeriodPreview,
        payPreviewLoading,
        currentPaySchedule,
      }}
    >
      <span data-testid="pay-schedule-edit-form">
        <FormProvider {...formMethods}>
          <Form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {children ? (
              children
            ) : (
              <Flex flexDirection="column">
                <Head />
                <List />
                <Edit />
                <Actions />
              </Flex>
            )}
          </Form>
        </FormProvider>
      </span>
    </PayScheduleProvider>
  )
}
