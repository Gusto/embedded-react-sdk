import { createMachine, invoke, state, transition } from 'robot3'

export const runPayrollStateMachine = createMachine({
  configuration: state(transition('calculate', 'calculating'), transition('edit', 'editEmployee')),
  calculating: state(transition('success', 'overview'), transition('error', 'configuration')),
  editEmployee: state(transition('return', 'configuration')),
  overview: state(transition('submit', 'submitting')),
  submitting: state(transition('success', 'summary'), transition('error', 'overview')),
  summary: state(),
})

export const runPayrollFlowStateMachine = createMachine({
  selectPayroll: state(transition('select', 'runPayroll')),
  runPayroll: invoke(runPayrollStateMachine, transition('selected', 'payrollSelected')),
  payrollSelected: state(transition('back', 'selectPayroll')),
})
