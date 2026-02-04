import { useState } from 'react'
import {
  EmploymentEligibilityPresentation,
  type EligibilityStatus,
  type AuthorizationDocumentType,
} from './EmploymentEligibilityPresentation'
import type { BaseComponentInterface } from '@/components/Base/Base'
import { BaseComponent } from '@/components/Base/Base'
import { useComponentDictionary, useI18n } from '@/i18n'

export type EmploymentEligibilityProps = BaseComponentInterface<'Employee.EmploymentEligibility'>

export function EmploymentEligibility(props: EmploymentEligibilityProps) {
  return (
    <BaseComponent {...props}>
      <Root {...props}>{props.children}</Root>
    </BaseComponent>
  )
}

const Root = ({ dictionary }: EmploymentEligibilityProps) => {
  useComponentDictionary('Employee.EmploymentEligibility', dictionary)
  useI18n('Employee.EmploymentEligibility')

  const [selectedStatus, setSelectedStatus] = useState<EligibilityStatus | undefined>(undefined)
  const [authorizedToWorkUntil, setAuthorizedToWorkUntil] = useState<Date | null>(null)
  const [authorizationDocumentType, setAuthorizationDocumentType] =
    useState<AuthorizationDocumentType>('uscis')
  const [uscisNumber, setUscisNumber] = useState('')
  const [i94AdmissionNumber, setI94AdmissionNumber] = useState('')
  const [foreignPassportNumber, setForeignPassportNumber] = useState('')
  const [countryOfIssuance, setCountryOfIssuance] = useState('')

  return (
    <EmploymentEligibilityPresentation
      selectedStatus={selectedStatus}
      onStatusChange={setSelectedStatus}
      authorizedToWorkUntil={authorizedToWorkUntil}
      onAuthorizedToWorkUntilChange={setAuthorizedToWorkUntil}
      authorizationDocumentType={authorizationDocumentType}
      onAuthorizationDocumentTypeChange={setAuthorizationDocumentType}
      uscisNumber={uscisNumber}
      onUscisNumberChange={setUscisNumber}
      i94AdmissionNumber={i94AdmissionNumber}
      onI94AdmissionNumberChange={setI94AdmissionNumber}
      foreignPassportNumber={foreignPassportNumber}
      onForeignPassportNumberChange={setForeignPassportNumber}
      countryOfIssuance={countryOfIssuance}
      onCountryOfIssuanceChange={setCountryOfIssuance}
    />
  )
}
