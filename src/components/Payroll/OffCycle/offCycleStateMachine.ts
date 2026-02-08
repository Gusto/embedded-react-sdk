import { state, transition, reduce } from 'robot3'
import {
  CreateOffCyclePayrollContextual,
  type OffCycleFlowContextInterface,
} from './OffCycleFlowComponents'
import { componentEvents } from '@/shared/constants'
import type { MachineTransition } from '@/types/Helpers'
import type { BreadcrumbNodes } from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'

export const offCycleBreadcrumbsNodes: BreadcrumbNodes = {
  createOffCyclePayroll: {
    parent: null,
    item: {
      id: 'createOffCyclePayroll',
      label: 'createOffCyclePayroll.breadcrumbLabel',
      namespace: 'Payroll.OffCycle',
      onNavigate: ((ctx: OffCycleFlowContextInterface) => ({
        ...ctx,
        component: CreateOffCyclePayrollContextual,
        currentBreadcrumbId: 'createOffCyclePayroll',
        progressBarType: 'breadcrumbs',
      })) as (context: unknown) => unknown,
    },
  },
}

export const offCycleMachine = {
  createOffCyclePayroll: state<MachineTransition>(
    transition(
      componentEvents.OFF_CYCLE_CREATED,
      'done',
      reduce(
        (
          ctx: OffCycleFlowContextInterface,
          ev: { payload?: { payrollUuid?: string } },
        ): OffCycleFlowContextInterface => ({
          ...ctx,
          payrollUuid: ev.payload?.payrollUuid,
        }),
      ),
    ),
  ),

  done: state<MachineTransition>(),
}
