import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { TextAreaField } from './TextAreaField'
import { ComponentsProvider } from '@/contexts/ComponentAdapter/ComponentsProvider'
import { defaultComponents } from '@/contexts/ComponentAdapter/adapters/defaultComponentAdapter'

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm()
  return (
    <ComponentsProvider components={defaultComponents}>
      <FormProvider {...methods}>{children}</FormProvider>
    </ComponentsProvider>
  )
}

describe('TextAreaField', () => {
  it('renders a textarea field', () => {
    render(
      <Wrapper>
        <TextAreaField name="description" label="Description" />
      </Wrapper>,
    )

    expect(screen.getByLabelText('Description')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(
      <Wrapper>
        <TextAreaField name="description" label="Description" placeholder="Enter description" />
      </Wrapper>,
    )

    const textarea = screen.getByPlaceholderText('Enter description')
    expect(textarea).toBeInTheDocument()
  })

  it('renders with custom rows', () => {
    render(
      <Wrapper>
        <TextAreaField name="description" label="Description" rows={6} />
      </Wrapper>,
    )

    const textarea = screen.getByLabelText('Description') as HTMLTextAreaElement
    expect(textarea.rows).toBe(6)
  })
})

