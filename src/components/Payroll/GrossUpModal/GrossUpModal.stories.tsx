import { Suspense, useState } from 'react'
import { MockBaseProvider } from '../../../../.storybook/helpers/MockBaseProvider'
import { GrossUpModal } from './GrossUpModal'
import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
import { useI18n } from '@/i18n'

function I18nLoader({ children }: { children: React.ReactNode }) {
  useI18n('Payroll.GrossUpModal')
  return <>{children}</>
}

export default {
  title: 'Domain/Payroll/GrossUpModal',
  decorators: [
    (Story: React.ComponentType) => (
      <Suspense fallback={<div>Loading translations...</div>}>
        <I18nLoader>
          <MockBaseProvider>
            <Story />
          </MockBaseProvider>
        </I18nLoader>
      </Suspense>
    ),
  ],
}

const mockCalculateGrossUp = async (netPay: number): Promise<string | null> => {
  await new Promise(resolve => setTimeout(resolve, 500))
  const grossUp = (netPay / 0.7).toFixed(2)
  return grossUp
}

export const Default = () => {
  const { Button } = useComponentContext()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => {
          setIsOpen(true)
        }}
      >
        Open Gross Up Modal
      </Button>
      <GrossUpModal
        isOpen={isOpen}
        onCalculateGrossUp={mockCalculateGrossUp}
        onApply={() => {
          setIsOpen(false)
        }}
        onCancel={() => {
          setIsOpen(false)
        }}
      />
    </>
  )
}

export const OpenByDefault = () => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <GrossUpModal
      isOpen={isOpen}
      onCalculateGrossUp={mockCalculateGrossUp}
      onApply={() => {
        setIsOpen(false)
      }}
      onCancel={() => {
        setIsOpen(false)
      }}
    />
  )
}
