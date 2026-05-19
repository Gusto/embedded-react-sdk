import { Suspense } from 'react'
import { fn } from 'storybook/test'
import type { Form } from '@gusto/embedded-api/models/components/form'
import { DocumentsView } from './DocumentsView'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Employee.Dashboard')
  return <>{children}</>
}

export default {
  title: 'Domain/Employee/Dashboard/DocumentsView',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <Story />
        </I18nLoader>
      </Suspense>
    ),
  ],
}

const onViewForm = fn().mockName('onViewForm')

const i9Form: Form = {
  uuid: 'i9-form-123',
  title: 'Form I-9',
  year: null,
  draft: false,
  requiresSigning: true,
}

const w4Form: Form = {
  uuid: 'w4-form-456',
  title: 'Form W-4',
  year: 2024,
  draft: false,
  requiresSigning: false,
}

const draftForm: Form = {
  uuid: 'draft-form-789',
  title: 'Form W-9',
  year: 2025,
  draft: true,
  requiresSigning: false,
}

export const Loading = () => <DocumentsView isLoading />

export const Empty = () => <DocumentsView forms={[]} />

export const SingleFormRequiresSigning = () => (
  <DocumentsView forms={[i9Form]} onViewForm={onViewForm} />
)

export const WithMultipleForms = () => (
  <DocumentsView forms={[i9Form, w4Form, draftForm]} onViewForm={onViewForm} />
)
