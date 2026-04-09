import { state } from 'robot3'
import type { MachineTransition } from '@/types/Helpers'

export const dashboardStateMachine = {
  index: state<MachineTransition>(),
}
