import { useComponentContext } from '@/contexts/ComponentAdapter/useComponentContext'
//TODO: Style appropriately once design is available
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  const Components = useComponentContext()
  if (!message) return
  return (
    <div role="alert" style={{ backgroundColor: 'rgba(255,0,0,0.2)', color: 'red' }}>
      {message}
      <Components.Button onClick={onClose}>Close</Components.Button>
    </div>
  )
}
