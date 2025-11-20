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

export function DeductionsForm(props: DeductionsFormProps & BaseComponentInterface) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

// deductions can be either custom or a garnishment
// we currently only support child support garnishment type
const SUPPORTED_GARNISHMENT_TYPES = ['child_support']

function Root({ className, employeeId, deductionId, dictionary }: DeductionsFormProps) {
  const { onEvent } = useBase()
  const { t } = useTranslation('Employee.Deductions')
  const Components = useComponentContext()

  useComponentDictionary('Employee.Deductions', dictionary)
  useI18n('Employee.Deductions')

  // Fetch all garnishments to find the specific one by ID
  const { data } = useGarnishmentsListSuspense({ employeeId })

  // Fetch child support garnishment metadata
  const { data: childSupportData } = useGarnishmentsGetChildSupportDataSuspense({})

  // find existing deduction to determine if in ADD or EDIT mode
  // if deduction exists we are editing, else we are adding
  // edit deductions cannot change the record type, it can only update the existing entries of the record
  const deduction = deductionId
    ? (data.garnishmentList?.find(g => g.uuid === deductionId) ?? null)
    : null
  const title = !deduction ? t('addDeductionTitle') : t('editDeductionTitle')
  const deductionType = deduction?.garnishmentType
  const stateAgencies =
    childSupportData.childSupportData?.agencies?.map(a => ({
      label: a.name as string,
      value: a.state as string,
    })) || []

  // if deduction exists check if it has a type, else if does not exist default to garnishment
  const [isGarnishment, setIsGarnishment] = useState<boolean>(
    (deductionType && SUPPORTED_GARNISHMENT_TYPES.includes(deductionType)) || !deduction,
  )
  const defaultDeductionTypeSelection = deduction
    ? deductionType
      ? 'garnishment'
      : 'custom'
    : 'garnishment'

  // filter out specific fipsCodes/counties as mapped to selected state agency
  // some states only have 1 fips code/county to cover the entire state,
  // but the API will return a null label so we need to provide a default label
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

  // get a reference to the currently selected agency to determine which required fields to display/include in submission
  const selectedAgency = childSupportData.childSupportData?.agencies?.find(
    agency => agency.state === stateAgency,
  )

  const handleCancel = () => {
    // if any active garnishments return to list view, else return to empty state view
    if (data.garnishmentList?.some(g => g.active)) {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL)
    } else {
      onEvent(componentEvents.EMPLOYEE_DEDUCTION_CANCEL_EMPTY)
    }
  }

  const handleSelectDeductionType = (selection: string) => {
    setIsGarnishment(selection === 'garnishment')
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
          <Components.Heading as="h3">{t('externalPostTaxDeductions')}</Components.Heading>
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
        {isGarnishment && (
          <section>
            <Components.Text weight="bold" className={styles.garnishmentTypeLabel}>
              {t('garnishmentType')}
            </Components.Text>
            {/* we currently only support child support garnishment type */}
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

      {isGarnishment ? (
        <ChildSupportForm
          deduction={deduction}
          employeeId={employeeId}
          handleStateAgencySelect={handleStateAgencySelect}
          stateAgencies={stateAgencies}
          counties={counties}
          selectedAgency={selectedAgency}
        />
      ) : (
        <CustomDeductionForm deduction={deduction} employeeId={employeeId} />
      )}
    </section>
  )
}
