import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useGarnishmentsGetChildSupportDataSuspense } from '@gusto/embedded-api/react-query/garnishmentsGetChildSupportData'
import styles from './DeductionsForm.module.scss'
import ChildSupportForm from './ChildSupportForm'
import CustomDeductionForm from './CustomDeductionForm'
import {
  BaseComponent,
  type BaseComponentInterface,
  type CommonComponentInterface,
  useBase,
} from '@/components/Base'
import { Grid } from '@/components/Common/Grid/Grid'
import { useI18n } from '@/i18n'
import { componentEvents } from '@/shared/constants'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useComponentDictionary } from '@/i18n/I18n'
import CaretLeft from '@/assets/icons/caret-left.svg?react'
interface DeductionsFormProps extends CommonComponentInterface<'Employee.Deductions'> {
  employeeId: string
  deductionId?: string | null
}

export function DeductionsFormV2(props: DeductionsFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

function Root({ className, employeeId, deductionId, dictionary }: DeductionsFormProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  // Fetch all garnishments to find the specific one by ID
  const { data } = useGarnishmentsListSuspense({ employeeId })

  // Fetch child support metadata
  const { data: childSupportData } = useGarnishmentsGetChildSupportDataSuspense({})

  // find existing deduction/garnishment to determine if in ADD or EDIT mode
  // if deduction exists we are editing, else we are adding
  // edit deductions cannot change the type, it can only update the existing entries of the record
  const deduction = deductionId
    ? (data.garnishmentList?.find(g => g.uuid === deductionId) ?? null)
    : null
  const title = !deduction ? t('addDeductionTitle') : t('editDeductionTitle')
  const deductionType = deduction?.garnishmentType
  const csAgencies =
    childSupportData.childSupportData?.agencies?.map(a => ({
      label: a.name as string,
      value: a.state as string,
    })) || []

  // if deduction exists check if it has a type, else if does not exist default to child support
  const [isChildSupport, setIsChildSupport] = useState<boolean>(
    deductionType === 'child_support' || !deduction,
  )
  const defaultDeductionTypeSelection = deduction
    ? deductionType
      ? 'garnishment'
      : 'custom'
    : 'garnishment'

  // filter out specific fipsCodes/counties as mapped to selected state agency
  // some states only have 1 fips code/county to cover the entire state,
  // but the API will return a null label so we need to provide a default
  const [stateAgency, setStateAgency] = useState<string>(deduction?.childSupport?.state || '')
  const handleStateAgencySelect = (stateAgency: string) => {
    setStateAgency(stateAgency)
  }
  const counties =
    childSupportData.childSupportData?.agencies
      ?.find(agency => agency.state === stateAgency)
      ?.fipsCodes?.map(fipsCode => ({
        label: fipsCode.county?.length ? fipsCode.county : t('allCounties'),
        value: fipsCode.code as string,
      })) || []

  const handleCancel = () => {
    onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
  }

  const handleSelectDeductionType = (selection: string) => {
    const isChildSupport = selection === 'garnishment'
    setIsChildSupport(isChildSupport)
  }

  return (
    <section className={className}>
      <Components.Button variant="secondary" onClick={handleCancel}>
        <CaretLeft className={styles.leftCaretIcon} />
        {t('backToDeductionsCta')}
      </Components.Button>
      <Grid gap={16} className={styles.formHeadingContainer}>
        <Components.Heading as="h2">{title}</Components.Heading>
        <section>
          <Components.Text weight="bold">{t('externalPostTaxDeductions')}</Components.Text>
          <Components.Text variant="supporting">
            {t('externalPostTaxDeductionsDescription')}
          </Components.Text>
        </section>
        <Components.RadioGroup
          label={t('deductionTypeLabel')}
          description={t('deductionTypeRadioLabel')}
          options={[
            { value: 'garnishment', label: t('garnishmentOption') },
            { value: 'custom', label: t('customDeductionOption') },
          ]}
          defaultValue={defaultDeductionTypeSelection}
          onChange={handleSelectDeductionType}
          isRequired
          isDisabled={!!deduction}
          className={styles.deductionTypeRadioGroup}
        />
        {/* currently the only garnishment we support is child support */}
        {isChildSupport && (
          <section>
            <Components.Text weight="bold" className={styles.garnishmentTypeLabel}>
              {t('garnishmentType')}
            </Components.Text>
            <Components.Select
              label={t('garnishmentType')}
              options={[]}
              placeholder={t('childSupport')}
              shouldVisuallyHideLabel
              isDisabled
            />
          </section>
        )}
        <hr />
      </Grid>

      {isChildSupport ? (
        <ChildSupportForm
          deduction={deduction}
          employeeId={employeeId}
          handleStateAgencySelect={handleStateAgencySelect}
          csAgencies={csAgencies}
          counties={counties}
        />
      ) : (
        <CustomDeductionForm deduction={deduction} employeeId={employeeId} />
      )}
    </section>
  )
}
