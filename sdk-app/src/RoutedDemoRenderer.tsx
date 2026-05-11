import { useParams } from 'react-router-dom'
import { findDemo } from './demos/registry'

export function RoutedDemoRenderer() {
  const { demoId } = useParams<{ demoId: string }>()
  const demo = findDemo(demoId)

  if (!demo) {
    return (
      <div style={{ padding: '2rem' }}>
        <h2>Demo not found</h2>
        <p>
          No demo matches id <code>{demoId}</code>.
        </p>
      </div>
    )
  }

  const DemoComponent = demo.component
  return <DemoComponent />
}
