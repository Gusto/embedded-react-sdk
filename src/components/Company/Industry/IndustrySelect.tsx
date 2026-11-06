import type { PropsWithChildren } from 'react'
import { Actions } from './Actions'
import { Head } from './Head'
import { Edit } from './Edit'
import { Form } from '@/components/Common/Form'
import { Flex } from '@/components/Common'

interface IndustrySelectProps extends PropsWithChildren {
  onSubmit: () => void
}

/** @internal */
export function IndustrySelect({ children, onSubmit }: IndustrySelectProps) {
  return (
    <Form onSubmit={onSubmit}>
      <Flex flexDirection="column" gap={32}>
        {children ?? (
          <>
            <Head />
            <Edit />
            <Actions />
          </>
        )}
      </Flex>
    </Form>
  )
}
