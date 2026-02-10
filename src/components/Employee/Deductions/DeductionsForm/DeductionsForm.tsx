import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useGarnishmentsListSuspense } from '@gusto/embedded-api/react-query/garnishmentsList'
import { useGarnishmentsGetChildSupportDataSuspense } from '@gusto/embedded-api/react-query/garnishmentsGetChildSupportData'
import type { GarnishmentType } from '@gusto/embedded-api/models/operations/postv1employeesemployeeidgarnishments'
import styles from './DeductionsForm.module.scss'
import ChildSupportForm from './ChildSupportForm'
import GarnishmentForm from './GarnishmentForm'
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
import { Flex } from '@/components/Common/Flex/Flex'

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

// deductions can be either garnishment (court-ordered) or a custom deduction
const SUPPORTED_GARNISHMENT_TYPES: GarnishmentType[] = [
  'child_support',
  'federal_tax_lien',
  'state_tax_lien',
  'student_loan',
  'creditor_garnishment',
  'federal_loan',
  'other_garnishment',
]

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
  const [selectedGarnishment, setSelectedGarnishment] = useState<GarnishmentType>(
    deductionType || 'child_support',
  )
  const garnishmentLabels: Record<string, string> = {
    child_support: t('childSupportTitle'),
    federal_tax_lien: t('federalTaxLien'),
    state_tax_lien: t('stateTaxLien'),
    student_loan: t('studentLoan'),
    creditor_garnishment: t('creditorGarnishment'),
    federal_loan: t('federalLoan'),
    other_garnishment: t('otherGarnishment'),
  }
  const garnishmentPlaceholder = garnishmentLabels[selectedGarnishment]
  const garnishmentOptions = SUPPORTED_GARNISHMENT_TYPES.map(garnishment => ({
    value: garnishment,
    label: garnishmentLabels[garnishment] as string,
  }))

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
      <Grid gap={32}>
        <Flex flexDirection="column" gap={2}>
          <Components.Heading as="h2">{title}</Components.Heading>
          <Components.Text variant="supporting">
            {t('externalPostTaxDeductionsDescription')}
          </Components.Text>
        </Flex>

        <Flex flexDirection="column" gap={20}>
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
            <Components.Select
              label={t('garnishmentType')}
              options={garnishmentOptions}
              placeholder={garnishmentPlaceholder}
              onChange={value => {
                setSelectedGarnishment(value as GarnishmentType)
              }}
              isDisabled={!!deduction} // API does not allow to change/edit an existing deduction type
              isRequired
            />
          )}
        </Flex>

        <hr />

        {isGarnishment ? (
          <>
            {selectedGarnishment === 'child_support' ? (
              <ChildSupportForm
                deduction={deduction}
                employeeId={employeeId}
                handleStateAgencySelect={handleStateAgencySelect}
                stateAgencies={stateAgencies}
                counties={counties}
                selectedAgency={selectedAgency}
                onCancel={handleCancel}
              />
            ) : (
              <GarnishmentForm
                deduction={deduction}
                employeeId={employeeId}
                selectedGarnishmentType={selectedGarnishment}
                selectedGarnishmentTitle={garnishmentPlaceholder!}
                onCancel={handleCancel}
              />
            )}
          </>
        ) : (
          <CustomDeductionForm
            deduction={deduction}
            employeeId={employeeId}
            onCancel={handleCancel}
          />
        )}
      </Grid>
    </section>
  )
}
