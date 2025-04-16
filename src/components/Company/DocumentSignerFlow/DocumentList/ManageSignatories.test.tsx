import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ManageSignatories } from './ManageSignatories'
import { useDocumentList } from './useDocumentList'

vi.mock('./useDocumentList')

const mockUseDocumentList = vi.mocked(useDocumentList)

const defaultMockValues = {
  isSelfSignatory: false,
  signatory: undefined,
  handleChangeSignatory: () => {},
  companyForms: [],
  documentListError: null,
  handleRequestFormToSign: () => {},
  handleContinue: () => {},
}

describe('ManageSignatories', () => {
  const mockHandleChangeSignatory = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('when no signatory is assigned', () => {
    mockUseDocumentList.mockReturnValue({
      ...defaultMockValues,
      isSelfSignatory: false,
      signatory: undefined,
    })

    render(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent('otherSignatoryTitle')
    expect(screen.getByRole('paragraph')).toHaveTextContent('noSignatorySubtext')
    expect(screen.getByRole('button')).toHaveTextContent('assignSignatoryCta')
  })

  test('when user is the signatory', () => {
    mockUseDocumentList.mockReturnValue({
      ...defaultMockValues,
      isSelfSignatory: true,
      signatory: {
        firstName: 'John',
        lastName: 'Doe',
        title: 'CEO',
        uuid: '123',
      },
    })

    render(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent('selfSignatoryTitle')
    expect(screen.getByRole('paragraph')).toHaveTextContent('selfSignatorySubtext')
    expect(screen.getByRole('button')).toHaveTextContent('changeSignatoryCta')
  })

  test('when another user is the signatory', () => {
    mockUseDocumentList.mockReturnValue({
      ...defaultMockValues,
      isSelfSignatory: false,
      signatory: {
        firstName: 'Jane',
        lastName: 'Smith',
        title: 'CEO',
        uuid: '456',
      },
    })

    render(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent('otherSignatoryTitle')
    expect(screen.getByRole('paragraph')).toHaveTextContent('otherSignatorySubtext')
    expect(screen.getByRole('button')).toHaveTextContent('changeSignatoryCta')
  })

  test('handles change signatory button click', async () => {
    mockUseDocumentList.mockReturnValue({
      ...defaultMockValues,
      handleChangeSignatory: mockHandleChangeSignatory,
    })

    render(<ManageSignatories />)

    await userEvent.click(screen.getByRole('button'))
    expect(mockHandleChangeSignatory).toHaveBeenCalledTimes(1)
  })
})
