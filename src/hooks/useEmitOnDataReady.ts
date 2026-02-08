import { useEffect, useRef } from 'react'
import type { OnEventType } from '@/components/Base/useBase'
import type { EventType } from '@/shared/constants'

export function useEmitOnDataReady<T>(
  onEvent: OnEventType<EventType, unknown>,
  eventType: EventType,
  data: T | undefined | null,
  mapPayload: (data: T) => unknown,
) {
  const hasEmitted = useRef(false)
  useEffect(() => {
    if (data != null && !hasEmitted.current) {
      hasEmitted.current = true
      onEvent(eventType, mapPayload(data))
    }
  }, [data, onEvent, eventType, mapPayload])
}
