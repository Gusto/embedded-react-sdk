import { Button } from '@/components/Common/UI/Button/Button'
//TODO: Style appropriately once design is available
export function Toast({ message, onClose }: { message: string | null; onClose: () => void }) {
  if (!message) return
  return (
    <div role="alert" style={{ backgroundColor: 'rgba(255,0,0,0.2)', color: 'red' }}>
      {message}
      <Button onClick={onClose}>Close</Button>
    </div>
  )
}
