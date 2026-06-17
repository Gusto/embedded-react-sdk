import { DocumentList, type FormData } from './DocumentList'

export default {
  title: 'Common/DocumentList',
}

const labels = {
  label: 'Documents to sign',
  columnLabels: { form: 'Form', action: 'Status' },
  statusLabels: {
    signCta: 'Sign',
    notSigned: 'Awaiting signature',
    complete: 'Signed',
  },
  emptyStateLabel: 'No documents to sign',
  errorLabel: 'We couldn’t load your documents. Try again later.',
}

const forms: FormData[] = [
  {
    uuid: 'form-1',
    title: 'Form W-4',
    description: 'Employee’s withholding certificate',
    requires_signing: true,
  },
  {
    uuid: 'form-2',
    title: 'Form I-9',
    description: 'Employment eligibility verification',
    requires_signing: false,
  },
  {
    uuid: 'form-3',
    title: 'Direct Deposit Authorization',
    description: 'Authorize payroll direct deposit',
    requires_signing: true,
  },
]

export const Populated = () => <DocumentList forms={forms} {...labels} />

export const ReadOnly = () => <DocumentList forms={forms} canSign={false} {...labels} />

export const Empty = () => <DocumentList forms={[]} {...labels} />

export const Error = () => <DocumentList forms={[]} withError {...labels} />
