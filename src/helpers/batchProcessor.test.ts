import { describe, it, expect, vi } from 'vitest'
import { splitIntoBatches, processBatches, DEFAULT_BATCH_SIZE } from './batchProcessor'

describe('batchProcessor', () => {
  describe('splitIntoBatches', () => {
    it('returns empty array when given empty array', () => {
      const result = splitIntoBatches([])
      expect(result).toEqual([])
    })

    it('returns single batch when items length is less than batch size', () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const result = splitIntoBatches(items)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveLength(50)
    })

    it('returns single batch when items length equals batch size', () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const result = splitIntoBatches(items)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveLength(100)
    })

    it('splits items into multiple batches when length exceeds batch size', () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const result = splitIntoBatches(items)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveLength(100)
      expect(result[1]).toHaveLength(50)
    })

    it('splits items into exact batches when length is multiple of batch size', () => {
      const items = Array.from({ length: 200 }, (_, i) => i)
      const result = splitIntoBatches(items)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveLength(100)
      expect(result[1]).toHaveLength(100)
    })

    it('handles custom batch sizes', () => {
      const items = Array.from({ length: 75 }, (_, i) => i)
      const result = splitIntoBatches(items, 25)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveLength(25)
      expect(result[1]).toHaveLength(25)
      expect(result[2]).toHaveLength(25)
    })

    it('throws error when batch size is zero', () => {
      expect(() => splitIntoBatches([1, 2, 3], 0)).toThrow('Batch size must be greater than 0')
    })

    it('throws error when batch size is negative', () => {
      expect(() => splitIntoBatches([1, 2, 3], -1)).toThrow('Batch size must be greater than 0')
    })

    it('preserves item order in batches', () => {
      const items = [1, 2, 3, 4, 5]
      const result = splitIntoBatches(items, 2)

      expect(result).toEqual([[1, 2], [3, 4], [5]])
    })
  })

  describe('processBatches', () => {
    it('processes empty array', async () => {
      const processFn = vi.fn().mockResolvedValue('result')
      const result = await processBatches([], processFn)

      expect(result).toEqual([])
      expect(processFn).not.toHaveBeenCalled()
    })

    it('processes single batch when items length is less than batch size', async () => {
      const items = Array.from({ length: 50 }, (_, i) => i)
      const processFn = vi.fn().mockResolvedValue('result')

      await processBatches(items, processFn)

      expect(processFn).toHaveBeenCalledTimes(1)
      expect(processFn).toHaveBeenCalledWith(items)
    })

    it('processes single batch when items length equals batch size', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i)
      const processFn = vi.fn().mockResolvedValue('result')

      await processBatches(items, processFn)

      expect(processFn).toHaveBeenCalledTimes(1)
      expect(processFn).toHaveBeenCalledWith(items)
    })

    it('processes multiple batches when items length exceeds batch size', async () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const processFn = vi.fn().mockResolvedValue('result')

      await processBatches(items, processFn)

      expect(processFn).toHaveBeenCalledTimes(2)
      expect(processFn).toHaveBeenNthCalledWith(1, items.slice(0, 100))
      expect(processFn).toHaveBeenNthCalledWith(2, items.slice(100, 150))
    })

    it('returns results from all batch processing calls', async () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const processFn = vi
        .fn()
        .mockResolvedValueOnce({ batch: 1 })
        .mockResolvedValueOnce({ batch: 2 })

      const result = await processBatches(items, processFn)

      expect(result).toEqual([{ batch: 1 }, { batch: 2 }])
    })

    it('processes batches sequentially', async () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const callOrder: number[] = []

      const processFn = vi.fn().mockImplementation(async (batch: number[]) => {
        const firstItem = batch[0]
        if (firstItem !== undefined) {
          callOrder.push(firstItem)
        }
        return `batch-${firstItem}`
      })

      await processBatches(items, processFn)

      expect(callOrder).toEqual([0, 100])
    })

    it('uses custom batch size', async () => {
      const items = Array.from({ length: 75 }, (_, i) => i)
      const processFn = vi.fn().mockResolvedValue('result')

      await processBatches(items, processFn, 25)

      expect(processFn).toHaveBeenCalledTimes(3)
    })

    it('propagates errors from processing function', async () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const processFn = vi.fn().mockRejectedValue(new Error('Processing failed'))

      await expect(processBatches(items, processFn)).rejects.toThrow('Processing failed')
    })

    it('uses DEFAULT_BATCH_SIZE when batch size is not specified', async () => {
      const items = Array.from({ length: 150 }, (_, i) => i)
      const processFn = vi.fn().mockResolvedValue('result')

      await processBatches(items, processFn)

      expect(processFn).toHaveBeenCalledTimes(2)
      const firstBatch = items.slice(0, DEFAULT_BATCH_SIZE)
      expect(processFn).toHaveBeenNthCalledWith(1, expect.arrayContaining(firstBatch))
    })
  })
})
