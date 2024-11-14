import { NumberFormatter } from '@internationalized/number'
import {
  Cell,
  Column,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
  Row,
  Separator,
  Table,
  TableBody,
  TableHeader,
} from 'react-aria-components'
import { useTranslation } from 'react-i18next'
import { BaseComponent, type BaseComponentInterface } from '@/components/Base'
import { Button, Flex } from '@/components/Common'
import { type EmployeeOnboardingContextInterface } from '@/components/Flow'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useGetEmployeeDeductions, useUpdateDeduction } from '@/api/queries/employee'
import { DeductionType } from '@/types'
import { useBase } from '../Base/useBase'
import { useAsyncError } from '../Common/hooks/useAsyncError'
import { useFlow } from '../Flow/useFlow'
import { useLocale } from '@/contexts/LocaleProvider/useLocale'

interface DeductionsProps {
  employeeId: string
}

export const Deductions = (props: DeductionsProps & BaseComponentInterface) => {
  const { employeeId, onEvent } = props
  const { setError } = useBase()
  useI18n('Employee.Deductions')
  const { t } = useTranslation('Employee.Deductions')
  const { locale, currency } = useLocale()

  const { data: deductions } = useGetEmployeeDeductions(employeeId)
  const throwError = useAsyncError()
  const formatterPercent = new NumberFormatter(locale, { style: 'percent' })
  const formatterCurrency = new NumberFormatter(locale, { style: 'currency', currency })

  // Used for deletion of a deduction in this context
  const { mutate: updateDeduction, isPending } = useUpdateDeduction(employeeId, {
    onSuccess: () => {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_DELETED)
    },
    onError: setError,
  })

  const deleteDeduction = (deduction: DeductionType) => {
    //Deletion of deduction is simply updating it with active: false
    try {
      updateDeduction({
        garnishment_id: deduction.uuid,
        body: { ...deduction, active: false, version: deduction.version as string },
      })
    } catch (err) {
      throwError(err)
    }
  }
  const handleAdd = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_CREATE, { employeeId })
  }
  const handleEdit = (deduction: DeductionType) => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_CREATE, { employeeId, deduction })
  }
  return (
    <BaseComponent {...props}>
      <h1>{t('pageTitle')}</h1>
      <hr />
      <p>{t('desc')}</p>
      <h2>{t('deductions')}</h2>

      <Button variant="secondary" onPress={handleAdd}>
        {t('addDeductionCta')}
      </Button>
      <Table aria-label={t('deductions')}>
        <TableHeader>
          <Column isRowHeader>{t('nameColumn')}</Column>
          <Column>{t('witholdAmtColumn')}</Column>
          <Column>{t('actionColumn')}</Column>
        </TableHeader>
        <TableBody renderEmptyState={() => t('emptyListMessage')}>
          {deductions.map(deduction => {
            return (
              deduction.active && (
                <Row key={deduction.uuid}>
                  <Cell>{deduction.description}</Cell>
                  <Cell>
                    {deduction.deduct_as_percentage
                      ? formatterPercent.format(Number(deduction.amount) / 100) //Formatter expects fraction for percent values
                      : formatterCurrency.format(Number(deduction.amount))}
                  </Cell>
                  <Cell>
                    <MenuTrigger>
                      <Button aria-label="Menu">
                        <strong>⋮</strong>
                      </Button>
                      <Popover>
                        <Menu>
                          <MenuItem
                            id="edit"
                            onAction={() => {
                              handleEdit(deduction)
                            }}
                          >
                            {t('editDeductionCta')}
                          </MenuItem>
                          <Separator />
                          <MenuItem
                            id="delete"
                            onAction={() => {
                              deleteDeduction(deduction)
                            }}
                          >
                            {t('deleteDeductionCta')}
                          </MenuItem>
                        </Menu>
                      </Popover>
                    </MenuTrigger>
                  </Cell>
                </Row>
              )
            )
          })}
        </TableBody>
      </Table>
      <Flex>
        <Button
          type="button"
          variant="secondary"
          onPress={() => {
            onEvent(componentEvents.CANCEL)
          }}
        >
          {t('backCta')}
        </Button>
        <Button
          type="button"
          onPress={() => {
            onEvent(componentEvents.EMPLOYEE_SUMMARY_VIEW)
          }}
          isLoading={isPending}
        >
          {t('continueToSummary')}
        </Button>
      </Flex>
    </BaseComponent>
  )
}

export const DeductionsContextual = () => {
  const { employeeId, onEvent } = useFlow<EmployeeOnboardingContextInterface>()
  const { t } = useTranslation('common')

  if (!employeeId) {
    throw new Error(
      t('errors.missingParamsOrContext', {
        component: 'Deductions',
        param: 'employeeId',
        provider: 'FlowProvider',
      }),
    )
  }
  return <Deductions employeeId={employeeId} onEvent={onEvent} />
}
