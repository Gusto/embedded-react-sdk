import type { Story } from '@ladle/react'
import { Banner } from './Banner'

export default {
  title: 'UI/Components/Banner',
}

export const Banners: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Banner
        status="info"
        label="This is an info banner"
        description="This is an info banner"
        onDismiss={() => {}}
      ></Banner>
      <Banner
        status="warning"
        label="This is an info banner"
        description="This is an info banner"
        onDismiss={() => {}}
      ></Banner>
      <Banner
        status="error"
        label="This is an info banner"
        description="This is an info banner"
        onDismiss={() => {}}
      ></Banner>
      <Banner
        status="success"
        label="This is an info banner"
        description="This is an info banner"
        primaryAction={{ label: 'Primary Action', onClick: () => {} }}
        secondaryAction={{ label: 'Secondary Action', onClick: () => {} }}
        onDismiss={() => {}}
      ></Banner>
    </div>
  )
}

export const BannersWithComponentSlot: Story = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Banner
        status="error"
        label="This is an info banner"
        description="This is an info banner"
        componentSlot={
          <div
            style={{
              backgroundColor: 'lightgray',
              height: '100px',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            This is a component slot
          </div>
        }
        onDismiss={() => {}}
      />
    </div>
  )
}
