import { describe, it, expect } from 'vitest'
import {
  buildBreadcrumbs,
  hideBreadcrumb,
  lockBreadcrumb,
  resolveBreadcrumbVariables,
  updateBreadcrumbs,
} from './breadcrumbHelpers'
import type {
  FlowBreadcrumb,
  BreadcrumbNodes,
} from '@/components/Common/FlowBreadcrumbs/FlowBreadcrumbsTypes'
import type { FlowHeaderConfig } from '@/components/Flow/useFlow'

const breadcrumbsHeader = (
  fields: Omit<Extract<FlowHeaderConfig, { type: 'breadcrumbs' }>, 'type'>,
): FlowHeaderConfig => ({ type: 'breadcrumbs', ...fields })

describe('buildBreadcrumbs', () => {
  it('should build breadcrumbs for a single node with no parent', () => {
    const nodes: BreadcrumbNodes = {
      root: {
        parent: null,
        item: { id: 'root', label: 'Root' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      root: [{ id: 'root', label: 'Root' }],
    })
  })

  it('should build breadcrumbs for a node with one parent', () => {
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: { id: 'parent', label: 'Parent' },
      },
      child: {
        parent: 'parent',
        item: { id: 'child', label: 'Child' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      parent: [{ id: 'parent', label: 'Parent' }],
      child: [
        { id: 'parent', label: 'Parent' },
        { id: 'child', label: 'Child' },
      ],
    })
  })

  it('should build breadcrumbs for nested parent chain', () => {
    const nodes: BreadcrumbNodes = {
      grandparent: {
        parent: null,
        item: { id: 'grandparent', label: 'Grandparent' },
      },
      parent: {
        parent: 'grandparent',
        item: { id: 'parent', label: 'Parent' },
      },
      child: {
        parent: 'parent',
        item: { id: 'child', label: 'Child' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      grandparent: [{ id: 'grandparent', label: 'Grandparent' }],
      parent: [
        { id: 'grandparent', label: 'Grandparent' },
        { id: 'parent', label: 'Parent' },
      ],
      child: [
        { id: 'grandparent', label: 'Grandparent' },
        { id: 'parent', label: 'Parent' },
        { id: 'child', label: 'Child' },
      ],
    })
  })

  it('should handle multiple nodes sharing common ancestors', () => {
    const nodes: BreadcrumbNodes = {
      root: {
        parent: null,
        item: { id: 'root', label: 'Root' },
      },
      branch1: {
        parent: 'root',
        item: { id: 'branch1', label: 'Branch 1' },
      },
      branch2: {
        parent: 'root',
        item: { id: 'branch2', label: 'Branch 2' },
      },
      leaf1: {
        parent: 'branch1',
        item: { id: 'leaf1', label: 'Leaf 1' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      root: [{ id: 'root', label: 'Root' }],
      branch1: [
        { id: 'root', label: 'Root' },
        { id: 'branch1', label: 'Branch 1' },
      ],
      branch2: [
        { id: 'root', label: 'Root' },
        { id: 'branch2', label: 'Branch 2' },
      ],
      leaf1: [
        { id: 'root', label: 'Root' },
        { id: 'branch1', label: 'Branch 1' },
        { id: 'leaf1', label: 'Leaf 1' },
      ],
    })
  })

  it('should preserve item properties including namespace and variables', () => {
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: {
          id: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
      },
      child: {
        parent: 'parent',
        item: {
          id: 'child',
          label: 'child.label',
          namespace: 'Child.Namespace',
          variables: { count: 5 },
        },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      parent: [
        {
          id: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
      ],
      child: [
        {
          id: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
        {
          id: 'child',
          label: 'child.label',
          namespace: 'Child.Namespace',
          variables: { count: 5 },
        },
      ],
    })
  })

  it('should handle real-world payroll flow structure', () => {
    const nodes: BreadcrumbNodes = {
      list: {
        parent: null,
        item: { id: 'list', label: 'breadcrumbs.list', namespace: 'Payroll.Flow' },
      },
      configuration: {
        parent: 'list',
        item: {
          id: 'configuration',
          label: 'breadcrumbs.configuration',
          namespace: 'Payroll.Flow',
        },
      },
      overview: {
        parent: 'configuration',
        item: { id: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
      },
      receipts: {
        parent: 'overview',
        item: { id: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result.list).toHaveLength(1)
    expect(result.configuration).toHaveLength(2)
    expect(result.overview).toHaveLength(3)
    expect(result.receipts).toHaveLength(4)

    expect(result.receipts).toEqual([
      { id: 'list', label: 'breadcrumbs.list', namespace: 'Payroll.Flow' },
      { id: 'configuration', label: 'breadcrumbs.configuration', namespace: 'Payroll.Flow' },
      { id: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
      { id: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
    ])
  })

  it('should handle empty nodes object', () => {
    const nodes: BreadcrumbNodes = {}

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({})
  })

  it('should maintain correct order in breadcrumb trail', () => {
    const nodes: BreadcrumbNodes = {
      step1: {
        parent: null,
        item: { id: 'step1', label: 'Step 1' },
      },
      step2: {
        parent: 'step1',
        item: { id: 'step2', label: 'Step 2' },
      },
      step3: {
        parent: 'step2',
        item: { id: 'step3', label: 'Step 3' },
      },
      step4: {
        parent: 'step3',
        item: { id: 'step4', label: 'Step 4' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    const step4Trail = result.step4
    expect(step4Trail).toBeDefined()
    expect(step4Trail?.[0]?.id).toBe('step1')
    expect(step4Trail?.[1]?.id).toBe('step2')
    expect(step4Trail?.[2]?.id).toBe('step3')
    expect(step4Trail?.[3]?.id).toBe('step4')
  })

  it('should not mutate original node items', () => {
    const originalItem: FlowBreadcrumb = { id: 'parent', label: 'Parent' }
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: originalItem,
      },
      child: {
        parent: 'parent',
        item: { id: 'child', label: 'Child' },
      },
    }

    buildBreadcrumbs(nodes)

    expect(originalItem).toEqual({ id: 'parent', label: 'Parent' })
  })
})

describe('hideBreadcrumb', () => {
  it('should remove the target breadcrumb from all trails', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          configuration: [{ id: 'configuration', label: 'Config' } as FlowBreadcrumb],
          overview: [
            { id: 'configuration', label: 'Config' } as FlowBreadcrumb,
            { id: 'overview', label: 'Overview' } as FlowBreadcrumb,
          ],
          receipts: [
            { id: 'configuration', label: 'Config' } as FlowBreadcrumb,
            { id: 'overview', label: 'Overview' } as FlowBreadcrumb,
            { id: 'receipts', label: 'Receipts' } as FlowBreadcrumb,
          ],
        },
      }),
    }

    const result = hideBreadcrumb('configuration', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs.configuration).toEqual([])
    expect(breadcrumbs.overview).toEqual([{ id: 'overview', label: 'Overview' }])
    expect(breadcrumbs.receipts).toEqual([
      { id: 'overview', label: 'Overview' },
      { id: 'receipts', label: 'Receipts' },
    ])
  })

  it('should not modify breadcrumbs that do not match the target id', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          overview: [
            { id: 'configuration', label: 'Config' } as FlowBreadcrumb,
            { id: 'overview', label: 'Overview' } as FlowBreadcrumb,
          ],
        },
      }),
    }

    const result = hideBreadcrumb('other', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs.overview).toEqual([
      { id: 'configuration', label: 'Config' },
      { id: 'overview', label: 'Overview' },
    ])
  })

  it('should preserve other context properties', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          step: [{ id: 'step', label: 'Step' } as FlowBreadcrumb],
        },
      }),
      companyId: 'test-company',
      payrollUuid: 'payroll-123',
    }

    const result = hideBreadcrumb('step', context)

    expect(result.companyId).toBe('test-company')
    expect(result.payrollUuid).toBe('payroll-123')
  })

  it('should handle empty breadcrumbs', () => {
    const context = { header: breadcrumbsHeader({ breadcrumbs: {} }) }

    const result = hideBreadcrumb('anything', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs).toEqual({})
  })

  it('should default to a breadcrumbs header when none is set', () => {
    const context: { header?: FlowHeaderConfig | null } = {}

    const result = hideBreadcrumb('anything', context)

    expect(result.header).toEqual({ type: 'breadcrumbs', breadcrumbs: {} })
  })
})

describe('lockBreadcrumb', () => {
  it('should mark the target breadcrumb as non-navigable across all trails', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          configuration: [{ id: 'configuration', label: 'Config' } as FlowBreadcrumb],
          overview: [
            { id: 'configuration', label: 'Config' } as FlowBreadcrumb,
            { id: 'overview', label: 'Overview' } as FlowBreadcrumb,
          ],
        },
      }),
    }

    const result = lockBreadcrumb('configuration', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs.configuration![0]!.isNavigable).toBe(false)
    expect(breadcrumbs.overview![0]!.isNavigable).toBe(false)
    expect(breadcrumbs.overview![1]!.isNavigable).toBeUndefined()
  })

  it('should not modify breadcrumbs that do not match the target id', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          overview: [
            { id: 'configuration', label: 'Config' } as FlowBreadcrumb,
            { id: 'overview', label: 'Overview' } as FlowBreadcrumb,
          ],
        },
      }),
    }

    const result = lockBreadcrumb('configuration', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs.overview![1]).toEqual({ id: 'overview', label: 'Overview' })
  })

  it('should preserve other context properties', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          step: [{ id: 'step', label: 'Step' } as FlowBreadcrumb],
        },
      }),
      companyId: 'test-company',
      payrollUuid: 'payroll-123',
    }

    const result = lockBreadcrumb('step', context)

    expect(result.companyId).toBe('test-company')
    expect(result.payrollUuid).toBe('payroll-123')
  })

  it('should handle empty breadcrumbs', () => {
    const context = { header: breadcrumbsHeader({ breadcrumbs: {} }) }

    const result = lockBreadcrumb('anything', context)
    const breadcrumbs =
      result.header.type === 'breadcrumbs' ? (result.header.breadcrumbs ?? {}) : {}

    expect(breadcrumbs).toEqual({})
  })
})

describe('resolveBreadcrumbVariables', () => {
  it('should return empty object when variables is undefined', () => {
    const context = { firstName: 'John', lastName: 'Doe' }

    const result = resolveBreadcrumbVariables(undefined, context)

    expect(result).toEqual({})
  })

  it('should resolve simple template variables from context', () => {
    const variables = {
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
    }
    const context = { firstName: 'Jane', lastName: 'Smith' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      firstName: 'Jane',
      lastName: 'Smith',
    })
  })

  it('should resolve template variables with whitespace', () => {
    const variables = {
      name: '{{ firstName }}',
      title: '{{  lastName  }}',
    }
    const context = { firstName: 'Bob', lastName: 'Johnson' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      name: 'Bob',
      title: 'Johnson',
    })
  })

  it('should use empty string for missing context values', () => {
    const variables = {
      firstName: '{{firstName}}',
      missingValue: '{{nonExistent}}',
    }
    const context = { firstName: 'Alice' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      firstName: 'Alice',
      missingValue: '',
    })
  })

  it('should keep literal values that are not templates', () => {
    const variables = {
      literal: 'Not a template',
      template: '{{firstName}}',
    }
    const context = { firstName: 'Charlie' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      literal: 'Not a template',
      template: 'Charlie',
    })
  })

  it('should handle mixed template and literal values', () => {
    const variables = {
      greeting: 'Hello',
      name: '{{firstName}}',
      status: 'active',
      id: '{{employeeId}}',
    }
    const context = { firstName: 'Emma', employeeId: '12345' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      greeting: 'Hello',
      name: 'Emma',
      status: 'active',
      id: '12345',
    })
  })

  it('should handle context values of different types', () => {
    const variables = {
      count: '{{count}}',
      isActive: '{{isActive}}',
      data: '{{data}}',
    }
    const context = { count: 42, isActive: true, data: { nested: 'value' } }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({
      count: 42,
      isActive: true,
      data: { nested: 'value' },
    })
  })

  it('should handle empty variables object', () => {
    const variables = {}
    const context = { firstName: 'Test' }

    const result = resolveBreadcrumbVariables(variables, context)

    expect(result).toEqual({})
  })
})

describe('updateBreadcrumbs', () => {
  it('should add breadcrumbs for a new state', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          list: [{ id: 'list', label: 'List' }],
          configuration: [
            { id: 'list', label: 'List' },
            { id: 'configuration', label: 'Configuration' },
          ],
        },
        currentBreadcrumbId: 'list',
      }),
    }

    const result = updateBreadcrumbs('configuration', context)

    expect(result.header.currentBreadcrumbId).toBe('configuration')
    expect(result.header.breadcrumbs?.configuration).toEqual([
      { id: 'list', label: 'List', variables: {} },
      { id: 'configuration', label: 'Configuration', variables: {} },
    ])
  })

  it('should initialize a breadcrumbs header when one is missing', () => {
    const context: { someOtherProp: string; header?: FlowHeaderConfig | null } = {
      someOtherProp: 'value',
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.header).toEqual({
      type: 'breadcrumbs',
      breadcrumbs: { newState: [] },
      currentBreadcrumbId: 'newState',
    })
  })

  it('should handle empty breadcrumb trail for new state', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          existingState: [{ id: 'existingState', label: 'Existing' }],
        },
        currentBreadcrumbId: 'existingState',
      }),
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.header.breadcrumbs?.newState).toEqual([])
    expect(result.header.breadcrumbs?.existingState).toEqual([
      { id: 'existingState', label: 'Existing' },
    ])
  })

  it('should preserve existing breadcrumbs for other states', () => {
    const context = {
      header: breadcrumbsHeader({
        breadcrumbs: {
          list: [{ id: 'list', label: 'List' }],
          configuration: [
            { id: 'list', label: 'List' },
            { id: 'configuration', label: 'Configuration' },
          ],
          overview: [
            { id: 'list', label: 'List' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'overview', label: 'Overview' },
          ],
        },
        currentBreadcrumbId: 'configuration',
      }),
    }

    const result = updateBreadcrumbs('overview', context)

    expect(result.header.breadcrumbs?.list).toEqual([{ id: 'list', label: 'List' }])
    expect(result.header.breadcrumbs?.configuration).toEqual([
      { id: 'list', label: 'List' },
      { id: 'configuration', label: 'Configuration' },
    ])
    expect(result.header.currentBreadcrumbId).toBe('overview')
  })

  it('should preserve other context properties', () => {
    const context = {
      payrollId: 'payroll-123',
      companyId: 'company-456',
      someFlag: true,
      header: breadcrumbsHeader({ breadcrumbs: {}, currentBreadcrumbId: 'initial' }),
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.payrollId).toBe('payroll-123')
    expect(result.companyId).toBe('company-456')
    expect(result.someFlag).toBe(true)
    expect(result.header.currentBreadcrumbId).toBe('newState')
  })

  it('should handle complex real-world scenario with multiple state transitions', () => {
    const initialContext = {
      firstName: 'Alice',
      lastName: 'Cooper',
      employeeId: 'emp-789',
      header: breadcrumbsHeader({
        breadcrumbs: {
          list: [{ id: 'list', label: 'List' }],
          configuration: [
            { id: 'list', label: 'List' },
            { id: 'configuration', label: 'Configuration' },
          ],
          editEmployee: [
            { id: 'list', label: 'List' },
            { id: 'configuration', label: 'Configuration' },
            { id: 'editEmployee', label: 'Edit Employee' },
          ],
        },
        currentBreadcrumbId: 'configuration',
      }),
    }

    const result = updateBreadcrumbs('editEmployee', initialContext, {
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
    })

    expect(result.header.breadcrumbs?.editEmployee).toEqual([
      { id: 'list', label: 'List', variables: { firstName: 'Alice', lastName: 'Cooper' } },
      {
        id: 'configuration',
        label: 'Configuration',
        variables: { firstName: 'Alice', lastName: 'Cooper' },
      },
      {
        id: 'editEmployee',
        label: 'Edit Employee',
        variables: { firstName: 'Alice', lastName: 'Cooper' },
      },
    ])
  })
})
