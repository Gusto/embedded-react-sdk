import type { Story } from '@ladle/react'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'

export default {
  title: 'UI/Typography/Heading',
}

export const AllHeadings: Story = () => {
  const Components = useComponentContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Components.Heading as="h1">This is an H1 Heading</Components.Heading>
      <Components.Heading as="h2">This is an H2 Heading</Components.Heading>
      <Components.Heading as="h3">This is an H3 Heading</Components.Heading>
      <Components.Heading as="h4">This is an H4 Heading</Components.Heading>
      <Components.Heading as="h5">This is an H5 Heading</Components.Heading>
      <Components.Heading as="h6">This is an H6 Heading</Components.Heading>
    </div>
  )
}

export const StyledDifferently: Story = () => {
  const Components = useComponentContext()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Components.Heading as="h2" styledAs="h4">
        This is an H2 styled as H4
      </Components.Heading>
      <Components.Heading as="h1" styledAs="h3">
        This is an H1 styled as H3
      </Components.Heading>
      <Components.Heading as="h3" styledAs="h1">
        This is an H3 styled as H1
      </Components.Heading>
      <Components.Heading as="h4" styledAs="h6">
        This is an H4 styled as H6
      </Components.Heading>
      <Components.Heading as="h6" styledAs="h2">
        This is an H6 styled as H2
      </Components.Heading>
    </div>
  )
}

export const TextAlignStart: Story = () => {
  const Components = useComponentContext()

  return (
    <Components.Heading as="h3" textAlign="start">
      This heading is aligned to the start
    </Components.Heading>
  )
}

export const TextAlignCenter: Story = () => {
  const Components = useComponentContext()

  return (
    <Components.Heading as="h3" textAlign="center">
      This heading is centered
    </Components.Heading>
  )
}

export const TextAlignEnd: Story = () => {
  const Components = useComponentContext()

  return (
    <Components.Heading as="h3" textAlign="end">
      This heading is aligned to the end
    </Components.Heading>
  )
}
