import { useTranslation } from 'react-i18next'
import { CompanyFormsCard } from './CompanyFormsCard'
import { CompanyFormsEditScreen } from './CompanyFormsEditScreen'
import { Flex } from '@/components/Common/Flex/Flex'
import { useFlow, type FlowContextInterface } from '@/components/Flow/useFlow'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { ensureRequired } from '@/helpers/ensureRequired'
import { componentEvents } from '@/shared/constants'

type CompanyFormsSuccessAlertCode = 'formsSigned'

/** @internal */
export interface CompanyFormsBlockContextInterface extends FlowContextInterface {
  companyId?: string
  /** Identifier of the signatory using the block, carried through to the signing surface. */
  viewerSignatoryId?: string
  successAlert?: CompanyFormsSuccessAlertCode | null
  /**
   * Set while the user is still inside the document surface, and promoted to `successAlert`
   * only once they leave it — a company signs its forms one at a time, so a signature must not
   * end the visit.
   */
  pendingAlert?: CompanyFormsSuccessAlertCode | null
}

/** @internal */
export function CompanyFormsCardContextual() {
  const { companyId, onEvent, successAlert, LoaderComponent } =
    useFlow<CompanyFormsBlockContextInterface>()
  const { t } = useTranslation('Company.Management.CompanyForms')
  const Components = useComponentContext()

  return (
    <Flex flexDirection="column" gap={16}>
      {successAlert ? (
        <Components.Alert
          status="success"
          label={t(`alerts.${successAlert}`)}
          onDismiss={() => {
            onEvent(componentEvents.COMPANY_MANAGEMENT_COMPANY_FORMS_ALERT_DISMISSED, null)
          }}
        />
      ) : null}
      <CompanyFormsCard
        companyId={ensureRequired(companyId)}
        onEvent={onEvent}
        LoaderComponent={LoaderComponent}
      />
    </Flex>
  )
}

/** @internal */
export function CompanyFormsEditScreenContextual() {
  const { companyId, viewerSignatoryId, onEvent } = useFlow<CompanyFormsBlockContextInterface>()
  return (
    <CompanyFormsEditScreen
      key={viewerSignatoryId}
      companyId={ensureRequired(companyId)}
      signatoryId={viewerSignatoryId}
      onEvent={onEvent}
    />
  )
}
