import { describe, it, expect } from 'vitest'
import {
  buildBreadcrumbs,
  resolveBreadcrumbVariables,
  updateBreadcrumbs,
} from './breadcrumbHelpers'
import type {
  Breadcrumb,
  BreadcrumbNodes,
} from '@/components/Common/UI/ProgressBreadcrumbs/ProgressBreadcrumbsTypes'

describe('buildBreadcrumbs', () => {
  it('should build breadcrumbs for a single node with no parent', () => {
    const nodes: BreadcrumbNodes = {
      root: {
        parent: null,
        item: { key: 'root', label: 'Root' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      root: [{ key: 'root', label: 'Root' }],
    })
  })

  it('should build breadcrumbs for a node with one parent', () => {
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: { key: 'parent', label: 'Parent' },
      },
      child: {
        parent: 'parent',
        item: { key: 'child', label: 'Child' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      parent: [{ key: 'parent', label: 'Parent' }],
      child: [
        { key: 'parent', label: 'Parent' },
        { key: 'child', label: 'Child' },
      ],
    })
  })

  it('should build breadcrumbs for nested parent chain', () => {
    const nodes: BreadcrumbNodes = {
      grandparent: {
        parent: null,
        item: { key: 'grandparent', label: 'Grandparent' },
      },
      parent: {
        parent: 'grandparent',
        item: { key: 'parent', label: 'Parent' },
      },
      child: {
        parent: 'parent',
        item: { key: 'child', label: 'Child' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      grandparent: [{ key: 'grandparent', label: 'Grandparent' }],
      parent: [
        { key: 'grandparent', label: 'Grandparent' },
        { key: 'parent', label: 'Parent' },
      ],
      child: [
        { key: 'grandparent', label: 'Grandparent' },
        { key: 'parent', label: 'Parent' },
        { key: 'child', label: 'Child' },
      ],
    })
  })

  it('should handle multiple nodes sharing common ancestors', () => {
    const nodes: BreadcrumbNodes = {
      root: {
        parent: null,
        item: { key: 'root', label: 'Root' },
      },
      branch1: {
        parent: 'root',
        item: { key: 'branch1', label: 'Branch 1' },
      },
      branch2: {
        parent: 'root',
        item: { key: 'branch2', label: 'Branch 2' },
      },
      leaf1: {
        parent: 'branch1',
        item: { key: 'leaf1', label: 'Leaf 1' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result).toEqual({
      root: [{ key: 'root', label: 'Root' }],
      branch1: [
        { key: 'root', label: 'Root' },
        { key: 'branch1', label: 'Branch 1' },
      ],
      branch2: [
        { key: 'root', label: 'Root' },
        { key: 'branch2', label: 'Branch 2' },
      ],
      leaf1: [
        { key: 'root', label: 'Root' },
        { key: 'branch1', label: 'Branch 1' },
        { key: 'leaf1', label: 'Leaf 1' },
      ],
    })
  })

  it('should preserve item properties including namespace and variables', () => {
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: {
          key: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
      },
      child: {
        parent: 'parent',
        item: {
          key: 'child',
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
          key: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
      ],
      child: [
        {
          key: 'parent',
          label: 'parent.label',
          namespace: 'Parent.Namespace',
        },
        {
          key: 'child',
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
        item: { key: 'list', label: 'breadcrumbs.list', namespace: 'Payroll.Flow' },
      },
      configuration: {
        parent: 'list',
        item: {
          key: 'configuration',
          label: 'breadcrumbs.configuration',
          namespace: 'Payroll.Flow',
        },
      },
      overview: {
        parent: 'configuration',
        item: { key: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
      },
      receipts: {
        parent: 'overview',
        item: { key: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    expect(result.list).toHaveLength(1)
    expect(result.configuration).toHaveLength(2)
    expect(result.overview).toHaveLength(3)
    expect(result.receipts).toHaveLength(4)

    expect(result.receipts).toEqual([
      { key: 'list', label: 'breadcrumbs.list', namespace: 'Payroll.Flow' },
      { key: 'configuration', label: 'breadcrumbs.configuration', namespace: 'Payroll.Flow' },
      { key: 'overview', label: 'breadcrumbs.overview', namespace: 'Payroll.Flow' },
      { key: 'receipts', label: 'breadcrumbs.receipts', namespace: 'Payroll.Flow' },
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
        item: { key: 'step1', label: 'Step 1' },
      },
      step2: {
        parent: 'step1',
        item: { key: 'step2', label: 'Step 2' },
      },
      step3: {
        parent: 'step2',
        item: { key: 'step3', label: 'Step 3' },
      },
      step4: {
        parent: 'step3',
        item: { key: 'step4', label: 'Step 4' },
      },
    }

    const result = buildBreadcrumbs(nodes)

    const step4Trail = result.step4
    expect(step4Trail).toBeDefined()
    expect(step4Trail?.[0]?.key).toBe('step1')
    expect(step4Trail?.[1]?.key).toBe('step2')
    expect(step4Trail?.[2]?.key).toBe('step3')
    expect(step4Trail?.[3]?.key).toBe('step4')
  })

  it('should not mutate original node items', () => {
    const originalItem: Breadcrumb = { key: 'parent', label: 'Parent' }
    const nodes: BreadcrumbNodes = {
      parent: {
        parent: null,
        item: originalItem,
      },
      child: {
        parent: 'parent',
        item: { key: 'child', label: 'Child' },
      },
    }

    buildBreadcrumbs(nodes)

    expect(originalItem).toEqual({ key: 'parent', label: 'Parent' })
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
      breadcrumbs: {
        list: [{ key: 'list', label: 'List' }],
        configuration: [
          { key: 'list', label: 'List' },
          { key: 'configuration', label: 'Configuration' },
        ],
      },
      currentBreadcrumb: 'list',
    }

    const result = updateBreadcrumbs('configuration', context)

    expect(result.currentBreadcrumb).toBe('configuration')
    expect(result.breadcrumbs.configuration).toEqual([
      { key: 'list', label: 'List' },
      { key: 'configuration', label: 'Configuration' },
    ])
  })

  it('should update variables for the current state breadcrumb', () => {
    const context = {
      firstName: 'John',
      lastName: 'Doe',
      breadcrumbs: {
        list: [{ key: 'list', label: 'List' }],
        editEmployee: [
          { key: 'list', label: 'List' },
          { key: 'editEmployee', label: 'Edit Employee' },
        ],
      },
      currentBreadcrumb: 'list',
    }

    const result = updateBreadcrumbs('editEmployee', context, {
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
    })

    expect(result.currentBreadcrumb).toBe('editEmployee')
    expect(result.breadcrumbs.editEmployee).toEqual([
      { key: 'list', label: 'List' },
      {
        key: 'editEmployee',
        label: 'Edit Employee',
        variables: { firstName: 'John', lastName: 'Doe' },
      },
    ])
  })

  it('should not update variables for parent breadcrumbs', () => {
    const context = {
      firstName: 'Jane',
      breadcrumbs: {
        list: [{ key: 'list', label: 'List', variables: { oldVar: 'old' } }],
        configuration: [
          { key: 'list', label: 'List', variables: { oldVar: 'old' } },
          { key: 'configuration', label: 'Configuration' },
        ],
      },
      currentBreadcrumb: 'list',
    }

    const result = updateBreadcrumbs('configuration', context, {
      firstName: '{{firstName}}',
    })

    expect(result.breadcrumbs.configuration).toEqual([
      { key: 'list', label: 'List', variables: { oldVar: 'old' } },
      {
        key: 'configuration',
        label: 'Configuration',
        variables: { firstName: 'Jane' },
      },
    ])
  })

  it('should initialize breadcrumbs when context has empty breadcrumbs', () => {
    const context = {
      someOtherProp: 'value',
      breadcrumbs: {},
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.breadcrumbs).toEqual({
      newState: [],
    })
    expect(result.currentBreadcrumb).toBe('newState')
  })

  it('should handle empty breadcrumb trail for new state', () => {
    const context = {
      breadcrumbs: {
        existingState: [{ key: 'existingState', label: 'Existing' }],
      },
      currentBreadcrumb: 'existingState',
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.breadcrumbs.newState).toEqual([])
    expect(result.breadcrumbs.existingState).toEqual([{ key: 'existingState', label: 'Existing' }])
  })

  it('should preserve existing breadcrumbs for other states', () => {
    const context = {
      breadcrumbs: {
        list: [{ key: 'list', label: 'List' }],
        configuration: [
          { key: 'list', label: 'List' },
          { key: 'configuration', label: 'Configuration' },
        ],
        overview: [
          { key: 'list', label: 'List' },
          { key: 'configuration', label: 'Configuration' },
          { key: 'overview', label: 'Overview' },
        ],
      },
      currentBreadcrumb: 'configuration',
    }

    const result = updateBreadcrumbs('overview', context)

    expect(result.breadcrumbs.list).toEqual([{ key: 'list', label: 'List' }])
    expect(result.breadcrumbs.configuration).toEqual([
      { key: 'list', label: 'List' },
      { key: 'configuration', label: 'Configuration' },
    ])
    expect(result.currentBreadcrumb).toBe('overview')
  })

  it('should preserve other context properties', () => {
    const context = {
      payrollId: 'payroll-123',
      companyId: 'company-456',
      someFlag: true,
      breadcrumbs: {},
      currentBreadcrumb: 'initial',
    }

    const result = updateBreadcrumbs('newState', context)

    expect(result.payrollId).toBe('payroll-123')
    expect(result.companyId).toBe('company-456')
    expect(result.someFlag).toBe(true)
    expect(result.currentBreadcrumb).toBe('newState')
  })

  it('should handle complex real-world scenario with multiple state transitions', () => {
    const initialContext = {
      firstName: 'Alice',
      lastName: 'Cooper',
      employeeId: 'emp-789',
      breadcrumbs: {
        list: [{ key: 'list', label: 'List' }],
        configuration: [
          { key: 'list', label: 'List' },
          { key: 'configuration', label: 'Configuration' },
        ],
        editEmployee: [
          { key: 'list', label: 'List' },
          { key: 'configuration', label: 'Configuration' },
          { key: 'editEmployee', label: 'Edit Employee' },
        ],
      },
      currentBreadcrumb: 'configuration',
    }

    const result = updateBreadcrumbs('editEmployee', initialContext, {
      firstName: '{{firstName}}',
      lastName: '{{lastName}}',
    })

    expect(result.breadcrumbs.editEmployee).toEqual([
      { key: 'list', label: 'List' },
      { key: 'configuration', label: 'Configuration' },
      {
        key: 'editEmployee',
        label: 'Edit Employee',
        variables: { firstName: 'Alice', lastName: 'Cooper' },
      },
    ])
  })
})
