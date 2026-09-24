import { Suspense } from 'react'
import { ExpertCircleBuilder } from './ExpertCircleBuilder'
import { Flex } from '@/components/Common'
import { BaseComponent } from '@/components/Base'

function ExpertCircleBuilderContent() {
  return <ExpertCircleBuilder />
}

export function ExpertCircle() {
  return (
    <BaseComponent onEvent={() => {}}>
      <Flex flexDirection="column" gap={0} alignItems="stretch">
        <Suspense fallback={<div>Loading...</div>}>
          <ExpertCircleBuilderContent />
        </Suspense>
      </Flex>
    </BaseComponent>
  )
}
