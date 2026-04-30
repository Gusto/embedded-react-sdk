import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HttpResponse } from 'msw'
import { useSignEmployeeForm } from './useSignEmployeeForm'
import type { UseSignEmployeeFormResult } from './useSignEmployeeForm'
import { MAX_PREPARERS } from './signEmployeeFormSchema'
import { server } from '@/test/mocks/server'
import {
  handleGetEmployeeForm,
  handleGetEmployeeFormPdf,
  handleSignEmployeeForm,
  i9Form,
  i9FormPdf,
} from '@/test/mocks/apis/employee_forms'
import { setupApiTestMocks } from '@/test/mocks/apiServer'
import { GustoTestProvider } from '@/test/GustoTestApiProvider'
import { fieldsMetadataEntry } from '@/test/fieldsMetadata'
import type { FieldMetadataWithOptions } from '@/partner-hook-utils/types'

type ReadyResult = Extract<UseSignEmployeeFormResult, { isLoading: false }>

function assertReady(hookResult: UseSignEmployeeFormResult): asserts hookResult is ReadyResult {
  if (hookResult.isLoading) {
    throw new Error('Expected hook to be ready but it is still loading')
  }
}

const nonI9Form = {
  ...i9Form,
  uuid: 'w4-form-456',
  name: 'W-4',
  title: 'Form W-4',
  description: 'Federal withholding form.',
}

function setFormValues(readyResult: ReadyResult, values: Record<string, unknown>) {
  const { formMethods } = readyResult.form.hookFormInternals
  for (const [key, value] of Object.entries(values)) {
    formMethods.setValue(key as never, value as never)
  }
}

describe('useSignEmployeeForm', () => {
  let signRequestBody: Record<string, unknown> | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    signRequestBody = null
    setupApiTestMocks()
  })

  describe('non-I9 form', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeForm(() => HttpResponse.json(nonI9Form)),
        handleGetEmployeeFormPdf(() => HttpResponse.json(i9FormPdf)),
        handleSignEmployeeForm(async ({ request }) => {
          signRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...nonI9Form, requires_signing: false })
        }),
      )
    })

    it('returns loading state initially then transitions to ready', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      expect(result.current.isLoading).toBe(true)
      expect(result.current.errorHandling).toBeDefined()

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.data.form).toBeDefined()
      expect(readyResult.data.form.title).toBe('Form W-4')
      expect(readyResult.data.pdfUrl).toBe('https://example.com/test-i9.pdf')
    })

    it('exposes Signature and ConfirmSignature fields', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.Signature).toBeDefined()
      expect(readyResult.form.Fields.ConfirmSignature).toBeDefined()
    })

    it('does not expose I9-specific fields for non-I9 forms', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.UsedPreparer).toBeUndefined()
      expect(readyResult.form.Fields.Preparer1).toBeUndefined()
      expect(readyResult.form.Fields.Preparer2).toBeUndefined()
      expect(readyResult.form.Fields.Preparer3).toBeUndefined()
      expect(readyResult.form.Fields.Preparer4).toBeUndefined()
    })

    it('does not expose preparer actions for non-I9 forms', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.actions.onSubmit).toBeDefined()
      expect(readyResult.actions).not.toHaveProperty('addPreparer')
      expect(readyResult.actions).not.toHaveProperty('removePreparer')
    })

    it('does not expose preparers metadata for non-I9 forms', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form).not.toHaveProperty('preparers')
    })

    it('submits a non-I9 form with signature and agree', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { signature: 'John Doe', confirmSignature: true })

      let submitResult: Awaited<ReturnType<ReadyResult['actions']['onSubmit']>>
      await act(async () => {
        submitResult = await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody?.signature_text).toBe('John Doe')
      expect(signRequestBody?.agree).toBe(true)
      expect(signRequestBody).not.toHaveProperty('preparer')
      expect(submitResult!).toBeDefined()
      expect(submitResult!.mode).toBe('create')
    })

    it('rejects submission when signature is empty', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { confirmSignature: true })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).toBeNull()
    })

    it('rejects submission when confirmSignature is false', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { signature: 'John Doe' })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).toBeNull()
    })

    it('marks signature and confirmSignature as required in fieldsMetadata', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(fieldsMetadataEntry(readyResult.form.fieldsMetadata, 'signature').isRequired).toBe(
        true,
      )
      expect(
        fieldsMetadataEntry(readyResult.form.fieldsMetadata, 'confirmSignature').isRequired,
      ).toBe(true)
    })
  })

  describe('I-9 form', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeForm(() => HttpResponse.json(i9Form)),
        handleGetEmployeeFormPdf(() => HttpResponse.json(i9FormPdf)),
        handleSignEmployeeForm(async ({ request }) => {
          signRequestBody = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ ...i9Form, requires_signing: false })
        }),
      )
    })

    it('detects I-9 form and exposes UsedPreparer field', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.UsedPreparer).toBeDefined()
    })

    it('exposes addPreparer and removePreparer actions for I-9 forms', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.actions.addPreparer).toBeDefined()
      expect(readyResult.actions.removePreparer).toBeDefined()
    })

    it('exposes preparers metadata with initial count of 0', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.preparers).toBeDefined()
      expect(readyResult.form.preparers!.count).toBe(0)
      expect(readyResult.form.preparers!.canAdd).toBe(true)
      expect(readyResult.form.preparers!.canRemove).toBe(false)
    })

    it('does not expose preparer field groups when count is 0', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.Preparer1).toBeUndefined()
      expect(readyResult.form.Fields.Preparer2).toBeUndefined()
      expect(readyResult.form.Fields.Preparer3).toBeUndefined()
      expect(readyResult.form.Fields.Preparer4).toBeUndefined()
    })

    it('exposes Preparer1 fields after setting usedPreparer to yes', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })

      readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.preparers!.canAdd).toBe(true)
      expect(readyResult.form.preparers!.canRemove).toBe(true)
      expect(readyResult.form.Fields.Preparer1).toBeDefined()
      const preparer1 = readyResult.form.Fields.Preparer1 as Record<string, unknown>
      expect(preparer1.FirstName).toBeDefined()
      expect(preparer1.LastName).toBeDefined()
      expect(preparer1.Street1).toBeDefined()
      expect(preparer1.Street2).toBeDefined()
      expect(preparer1.City).toBeDefined()
      expect(preparer1.State).toBeDefined()
      expect(preparer1.Zip).toBeDefined()
      expect(preparer1.Signature).toBeDefined()
      expect(preparer1.ConfirmSignature).toBeDefined()
      expect(readyResult.form.Fields.Preparer2).toBeUndefined()
    })

    it('can add up to MAX_PREPARERS and caps at that limit', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })

      for (let i = 1; i < MAX_PREPARERS; i++) {
        readyResult = result.current as ReadyResult
        readyResult.actions.addPreparer!()
      }

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(MAX_PREPARERS)
      })

      readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.preparers!.canAdd).toBe(false)
      expect(readyResult.form.preparers!.canRemove).toBe(true)
      expect(readyResult.form.Fields.Preparer1).toBeDefined()
      expect(readyResult.form.Fields.Preparer2).toBeDefined()
      expect(readyResult.form.Fields.Preparer3).toBeDefined()
      expect(readyResult.form.Fields.Preparer4).toBeDefined()

      readyResult.actions.addPreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(MAX_PREPARERS)
      })
    })

    it('removes preparers and unregisters their fields', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })
      ;(result.current as ReadyResult).actions.addPreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(2)
      })

      readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.Preparer2).toBeDefined()

      readyResult.actions.removePreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })

      readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.Fields.Preparer2).toBeUndefined()
      expect(readyResult.form.Fields.Preparer1).toBeDefined()
    })

    it('removePreparer does nothing when count is 0', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.preparers!.count).toBe(0)

      readyResult.actions.removePreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(0)
      })
    })

    it('submits I-9 form without preparer when usedPreparer is "no"', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { signature: 'Jane Smith', confirmSignature: true })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody?.signature_text).toBe('Jane Smith')
      expect(signRequestBody?.agree).toBe(true)
      expect(signRequestBody?.preparer).toBe(false)
    })

    it('submits I-9 form with a single preparer', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBeGreaterThanOrEqual(1)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, {
        signature: 'Jane Smith',
        confirmSignature: true,
        preparerFirstName: 'Prep',
        preparerLastName: 'Arer',
        preparerStreet1: '123 Main St',
        preparerCity: 'Anytown',
        preparerState: 'CA',
        preparerZip: '90210',
        preparerSignature: 'Prep Arer',
        preparerAgree: true,
      })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody?.signature_text).toBe('Jane Smith')
      expect(signRequestBody?.agree).toBe(true)
      expect(signRequestBody?.preparer).toBe(true)
      expect(signRequestBody?.preparer_first_name).toBe('Prep')
      expect(signRequestBody?.preparer_last_name).toBe('Arer')
      expect(signRequestBody?.preparer_street_1).toBe('123 Main St')
      expect(signRequestBody?.preparer_city).toBe('Anytown')
      expect(signRequestBody?.preparer_state).toBe('CA')
      expect(signRequestBody?.preparer_zip).toBe('90210')
      expect(signRequestBody?.preparer_agree).toBe('true')
    })

    it('submits I-9 form with multiple preparers', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })
      ;(result.current as ReadyResult).actions.addPreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(2)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, {
        signature: 'Jane Smith',
        confirmSignature: true,
        usedPreparer: 'yes',
        preparerFirstName: 'Prep',
        preparerLastName: 'One',
        preparerStreet1: '111 First St',
        preparerCity: 'CityOne',
        preparerState: 'CA',
        preparerZip: '11111',
        preparerSignature: 'Prep One',
        preparerAgree: true,
        preparer2FirstName: 'Prep',
        preparer2LastName: 'Two',
        preparer2Street1: '222 Second St',
        preparer2City: 'CityTwo',
        preparer2State: 'NY',
        preparer2Zip: '22222',
        preparer2Signature: 'Prep Two',
        preparer2Agree: true,
      })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody?.preparer).toBe(true)
      expect(signRequestBody?.preparer_first_name).toBe('Prep')
      expect(signRequestBody?.preparer_last_name).toBe('One')

      expect(signRequestBody?.preparer2).toBe(true)
      expect(signRequestBody?.preparer2_first_name).toBe('Prep')
      expect(signRequestBody?.preparer2_last_name).toBe('Two')
      expect(signRequestBody?.preparer2_state).toBe('NY')
    })

    it('omits optional preparer street2 from payload when empty', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBeGreaterThanOrEqual(1)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, {
        signature: 'Jane Smith',
        confirmSignature: true,
        preparerFirstName: 'Prep',
        preparerLastName: 'Arer',
        preparerStreet1: '123 Main St',
        preparerCity: 'Anytown',
        preparerState: 'CA',
        preparerZip: '90210',
        preparerSignature: 'Prep Arer',
        preparerAgree: true,
      })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody).not.toHaveProperty('preparer_street_2')
    })

    it('includes optional preparer street2 in payload when provided', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBeGreaterThanOrEqual(1)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, {
        signature: 'Jane Smith',
        confirmSignature: true,
        preparerFirstName: 'Prep',
        preparerLastName: 'Arer',
        preparerStreet1: '123 Main St',
        preparerStreet2: 'Suite 200',
        preparerCity: 'Anytown',
        preparerState: 'CA',
        preparerZip: '90210',
        preparerSignature: 'Prep Arer',
        preparerAgree: true,
      })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).not.toBeNull()
      expect(signRequestBody?.preparer_street_2).toBe('Suite 200')
    })

    it('rejects submission when preparer confirmSignature is false', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBeGreaterThanOrEqual(1)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, {
        signature: 'Jane Smith',
        confirmSignature: true,
        preparerFirstName: 'Prep',
        preparerLastName: 'Arer',
        preparerStreet1: '123 Main St',
        preparerCity: 'Anytown',
        preparerState: 'CA',
        preparerZip: '90210',
        preparerSignature: 'Prep Arer',
      })

      await act(async () => {
        await readyResult.actions.onSubmit()
      })

      expect(signRequestBody).toBeNull()
    })

    it('provides usedPreparer field options in fieldsMetadata', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      const usedPreparerMeta = readyResult.form.fieldsMetadata
        .usedPreparer as FieldMetadataWithOptions
      expect(usedPreparerMeta).toBeDefined()
      expect(usedPreparerMeta.options).toBeDefined()
      expect(usedPreparerMeta.options).toHaveLength(2)
    })

    it('provides state options for preparer state fields in fieldsMetadata', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      const preparerStateMeta = readyResult.form.fieldsMetadata
        .preparerState as FieldMetadataWithOptions
      expect(preparerStateMeta).toBeDefined()
      expect(preparerStateMeta.options).toBeDefined()
      expect(preparerStateMeta.options.length).toBeGreaterThan(0)
      expect(preparerStateMeta.options.some((o: { value: string }) => o.value === 'CA')).toBe(true)
    })

    it('automatically adds a preparer when usedPreparer changes to "yes"', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.form.preparers!.count).toBe(0)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })

      expect((result.current as ReadyResult).form.Fields.Preparer1).toBeDefined()
    })

    it('automatically removes all preparers when usedPreparer changes to "no"', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })
      ;(result.current as ReadyResult).actions.addPreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBeGreaterThanOrEqual(2)
      })

      readyResult = result.current as ReadyResult
      setFormValues(readyResult, { usedPreparer: 'no' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(0)
      })

      readyResult = result.current as ReadyResult
      expect(readyResult.form.Fields.Preparer1).toBeUndefined()
      expect(readyResult.form.Fields.Preparer2).toBeUndefined()
    })

    it('does not auto-add preparer if usedPreparer is "yes" and count is already > 0', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })
      ;(result.current as ReadyResult).actions.addPreparer!()

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(2)
      })
    })

    it('marks preparer street2 as not required in fieldsMetadata', async () => {
      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'i9-form-123' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      setFormValues(readyResult, { usedPreparer: 'yes' })

      await waitFor(() => {
        expect((result.current as ReadyResult).form.preparers!.count).toBe(1)
      })

      expect(
        fieldsMetadataEntry((result.current as ReadyResult).form.fieldsMetadata, 'preparerStreet2')
          .isRequired,
      ).toBe(false)
    })
  })

  describe('error handling', () => {
    it('provides errorHandling in loading state when queries fail', async () => {
      server.use(
        handleGetEmployeeForm(() => HttpResponse.json({ message: 'Not found' }, { status: 404 })),
        handleGetEmployeeFormPdf(() =>
          HttpResponse.json({ message: 'Not found' }, { status: 404 }),
        ),
      )

      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'bad-id' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.errorHandling.errors.length).toBeGreaterThan(0)
      })

      expect(result.current.errorHandling.retryQueries).toBeDefined()
      expect(result.current.errorHandling.clearSubmitError).toBeDefined()
    })
  })

  describe('isPending status', () => {
    beforeEach(() => {
      server.use(
        handleGetEmployeeForm(() => HttpResponse.json(nonI9Form)),
        handleGetEmployeeFormPdf(() => HttpResponse.json(i9FormPdf)),
      )
    })

    it('starts with isPending false', async () => {
      server.use(
        handleSignEmployeeForm(() => HttpResponse.json({ ...nonI9Form, requires_signing: false })),
      )

      const { result } = renderHook(
        () => useSignEmployeeForm({ employeeId: 'emp-1', formId: 'w4-form-456' }),
        { wrapper: GustoTestProvider },
      )

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const readyResult = result.current
      assertReady(readyResult)

      expect(readyResult.status.isPending).toBe(false)
    })
  })
})
