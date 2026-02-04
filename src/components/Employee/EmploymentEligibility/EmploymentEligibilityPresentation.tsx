import { useTranslation } from 'react-i18next'
import { Flex } from '@/components/Common'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { COUNTRIES } from '@/shared/countries'

export type EligibilityStatus =
  | 'citizen'
  | 'lawfulPermanentResident'
  | 'noncitizen'
  | 'noncitizen_authorized'

export type AuthorizationDocumentType = 'uscis' | 'i94' | 'foreignPassport'

interface EmploymentEligibilityPresentationProps {
  selectedStatus: EligibilityStatus | undefined
  onStatusChange: (status: EligibilityStatus) => void
  authorizedToWorkUntil: Date | null
  onAuthorizedToWorkUntilChange: (date: Date | null) => void
  authorizationDocumentType: AuthorizationDocumentType
  onAuthorizationDocumentTypeChange: (type: AuthorizationDocumentType) => void
  uscisNumber: string
  onUscisNumberChange: (value: string) => void
  i94AdmissionNumber: string
  onI94AdmissionNumberChange: (value: string) => void
  foreignPassportNumber: string
  onForeignPassportNumberChange: (value: string) => void
  countryOfIssuance: string
  onCountryOfIssuanceChange: (value: string) => void
}

const statusDescriptionKeys = {
  citizen: 'statusDescriptions.citizen',
  lawfulPermanentResident: 'statusDescriptions.lawfulPermanentResident',
  noncitizen: 'statusDescriptions.noncitizen',
  noncitizen_authorized: 'statusDescriptions.noncitizen_authorized',
} as const

export const EmploymentEligibilityPresentation = ({
  selectedStatus,
  onStatusChange,
  authorizedToWorkUntil,
  onAuthorizedToWorkUntilChange,
  authorizationDocumentType,
  onAuthorizationDocumentTypeChange,
  uscisNumber,
  onUscisNumberChange,
  i94AdmissionNumber,
  onI94AdmissionNumberChange,
  foreignPassportNumber,
  onForeignPassportNumberChange,
  countryOfIssuance,
  onCountryOfIssuanceChange,
}: EmploymentEligibilityPresentationProps) => {
  const { Heading, Text, Select, Alert, DatePicker, RadioGroup, TextInput } = useComponentContext()
  const { t } = useTranslation('Employee.EmploymentEligibility')

  const statusOptions = [
    { value: 'citizen', label: t('select.options.citizen') },
    { value: 'lawfulPermanentResident', label: t('select.options.lawfulPermanentResident') },
    { value: 'noncitizen', label: t('select.options.noncitizen') },
    { value: 'noncitizen_authorized', label: t('select.options.noncitizen_authorized') },
  ]

  const authorizationDocumentOptions = [
    { value: 'uscis', label: t('authorizationDocument.options.uscis') },
    { value: 'i94', label: t('authorizationDocument.options.i94') },
    { value: 'foreignPassport', label: t('authorizationDocument.options.foreignPassport') },
  ]

  const handleStatusChange = (value: string) => {
    onStatusChange(value as EligibilityStatus)
  }

  const handleAuthorizationDocumentTypeChange = (value: string) => {
    onAuthorizationDocumentTypeChange(value as AuthorizationDocumentType)
  }

  const uscisNumberInput = (
    <TextInput
      label={t('uscisNumber.label')}
      description={t('uscisNumber.description')}
      value={uscisNumber}
      onChange={onUscisNumberChange}
    />
  )

  const showUscisInput =
    selectedStatus === 'lawfulPermanentResident' ||
    (selectedStatus === 'noncitizen_authorized' && authorizationDocumentType === 'uscis')

  return (
    <Flex flexDirection="column" gap={16}>
      <Flex flexDirection="column" gap={2}>
        <Heading as="h2">{t('title')}</Heading>
        <Text variant="supporting">{t('subtitle')}</Text>
      </Flex>

      <Select
        label={t('select.label')}
        description={t('select.description')}
        placeholder={t('select.placeholder')}
        options={statusOptions}
        value={selectedStatus}
        onChange={handleStatusChange}
        isRequired
      />

      {selectedStatus && (
        <Alert
          status="info"
          label={t(statusDescriptionKeys[selectedStatus])}
          disableScrollIntoView
        />
      )}

      {selectedStatus === 'noncitizen_authorized' && (
        <>
          <Flex flexDirection="column" gap={20}>
            <DatePicker
              label={t('authorizedToWorkUntil.label')}
              value={authorizedToWorkUntil}
              onChange={onAuthorizedToWorkUntilChange}
              isRequired
            />

            <RadioGroup
              label={t('authorizationDocument.label')}
              options={authorizationDocumentOptions}
              value={authorizationDocumentType}
              onChange={handleAuthorizationDocumentTypeChange}
              isRequired
            />

            {authorizationDocumentType === 'i94' && (
              <TextInput
                label={t('i94AdmissionNumber.label')}
                description={t('i94AdmissionNumber.description')}
                value={i94AdmissionNumber}
                onChange={onI94AdmissionNumberChange}
                isRequired
              />
            )}

            {authorizationDocumentType === 'foreignPassport' && (
              <>
                <TextInput
                  label={t('foreignPassport.label')}
                  value={foreignPassportNumber}
                  onChange={onForeignPassportNumberChange}
                  isRequired
                />

                <Select
                  label={t('countryOfIssuance.label')}
                  description={t('countryOfIssuance.description')}
                  options={COUNTRIES}
                  value={countryOfIssuance}
                  onChange={onCountryOfIssuanceChange}
                  isRequired
                />
              </>
            )}
          </Flex>
        </>
      )}

      {showUscisInput && uscisNumberInput}
    </Flex>
  )
}
