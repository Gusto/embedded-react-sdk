import type { EmptyStateConfig } from './useDataView'
import { EmptyData } from '@/components/Common/EmptyData/EmptyData'
import { ActionsLayout } from '@/components/Common/ActionsLayout/ActionsLayout'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export function EmptyStateFromConfig({ config }: { config: EmptyStateConfig }) {
  const { Button } = useComponentContext()

  return (
    <EmptyData title={config.title} description={config.description}>
      {config.action && (
        <ActionsLayout justifyContent="center">
          <Button variant="secondary" onClick={config.action.onClick}>
            {config.action.label}
          </Button>
        </ActionsLayout>
      )}
    </EmptyData>
  )
}
