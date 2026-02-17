import { useEmployeeDocumentSigner } from './useEmployeeDocumentSigner'
import { Flow } from '@/components/Flow/Flow'
import type { BaseComponentInterface } from '@/components/Base'
import { useComponentDictionary } from '@/i18n/I18n'

export interface DocumentSignerProps extends BaseComponentInterface<'Employee.DocumentSigner'> {
  employeeId: string
}

export const DocumentSigner = ({ employeeId, onEvent, dictionary }: DocumentSignerProps) => {
  useComponentDictionary('Employee.DocumentSigner', dictionary)

  const {
    meta: { machine },
  } = useEmployeeDocumentSigner({ employeeId })

  return <Flow machine={machine} onEvent={onEvent} />
}
