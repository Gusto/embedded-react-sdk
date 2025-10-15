import { describe, it, expect } from 'vitest'
import { buildBreadcrumbs } from './buildBreadcrumbs'
import type {
  BreadcrumbStep,
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
    const originalItem: BreadcrumbStep = { key: 'parent', label: 'Parent' }
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
