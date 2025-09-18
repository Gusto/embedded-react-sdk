import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { ManageSignatories } from './ManageSignatories'
import { useDocumentList } from './useDocumentList'
import { renderWithProviders } from '@/test-utils/renderWithProviders'
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

    renderWithProviders(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent('Only the signatory can sign documents.')
    expect(screen.getByRole('paragraph')).toHaveTextContent('A signatory has not yet been assigned')
    expect(screen.getByRole('button')).toHaveTextContent('Assign signatory')
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

    renderWithProviders(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent(
      'Please note, only the signatory can sign documents.',
    )
    expect(screen.getByRole('paragraph')).toHaveTextContent('You are the assigned signatory.')
    expect(screen.getByRole('button')).toHaveTextContent('Change signatory')
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

    renderWithProviders(<ManageSignatories />)

    expect(screen.getByRole('heading')).toHaveTextContent('Only the signatory can sign documents.')
    expect(screen.getByRole('paragraph')).toHaveTextContent('Your signatory is Jane Smith, CEO.')
    expect(screen.getByRole('button')).toHaveTextContent('Change signatory')
  })

  test('handles change signatory button click', async () => {
    mockUseDocumentList.mockReturnValue({
      ...defaultMockValues,
      handleChangeSignatory: mockHandleChangeSignatory,
    })

    renderWithProviders(<ManageSignatories />)

    await userEvent.click(screen.getByRole('button'))
    expect(mockHandleChangeSignatory).toHaveBeenCalledTimes(1)
  })
})
