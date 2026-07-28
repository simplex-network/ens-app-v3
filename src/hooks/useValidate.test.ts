import { renderHook } from '@app/test-utils'

import { describe, expect, it } from 'vitest'

import {
  makeMockUseValidate,
  mockUseValidateConfig,
  mockUseValidateTypes,
} from '../../test/mock/makeMockUseValidate'
import { useValidate } from './useValidate'

describe('useValidate', () => {
  it('should return isNonASCII as false if all ascii', async () => {
    const { result } = renderHook(() => useValidate({ input: 'test' }))
    expect(result.current.isNonASCII).toEqual(false)
  })
  it('should return isNonASCII as true if contains non ascii', async () => {
    const { result } = renderHook(() => useValidate({ input: 'test❤️' }))
    expect(result.current.isNonASCII).toEqual(true)
  })
  it('should not error if % symbol is in input', async () => {
    const { result } = renderHook(() => useValidate({ input: '%' }))
    expect(result.current.isValid).toEqual(false)
  })
  it('should return isValid as false for non-latin characters', async () => {
    const { result } = renderHook(() => useValidate({ input: 'дом' }))
    expect(result.current.isValid).toEqual(false)
  })
  it('should return isValid as false for emoji', async () => {
    const { result } = renderHook(() => useValidate({ input: 'name❤️' }))
    expect(result.current.isValid).toEqual(false)
  })
  it('should return isValid as false for punctuation ENS normalisation permits', async () => {
    const { result } = renderHook(() => useValidate({ input: '_underscore' }))
    expect(result.current.isValid).toEqual(false)
  })
  it('should return isValid as true for labels of letters, digits and hyphens', async () => {
    const { result } = renderHook(() => useValidate({ input: 'foo-1.testing' }))
    expect(result.current.isValid).toEqual(true)
  })
  it('should accept uppercase input because normalisation lowercases it', async () => {
    const { result } = renderHook(() => useValidate({ input: 'FOO' }))
    expect(result.current.isValid).toEqual(true)
    expect(result.current.name).toEqual('foo')
  })
  it('should cache the result for the same input', () => {
    const { result, rerender } = renderHook(({ input }) => useValidate({ input }), {
      initialProps: { input: 'test' },
    })
    const firstResult = result.current
    rerender({ input: 'test' })
    const secondResult = result.current
    expect(firstResult).toBe(secondResult)
  })
  it('should process different inputs independently', () => {
    const { result, rerender } = renderHook(({ input }) => useValidate({ input }), {
      initialProps: { input: 'test' },
    })
    const firstResult = result.current
    rerender({ input: 'anotherTest' })
    const secondResult = result.current
    expect(firstResult).not.toBe(secondResult)
  })
  it('should return defaultData for empty input', () => {
    const { result } = renderHook(() => useValidate({ input: '' }))
    expect(result.current).toEqual({
      name: '',
      beautifiedName: '',
      isNonASCII: undefined,
      labelCount: 0,
      type: undefined,
      isValid: undefined,
      isShort: undefined,
      is2LD: undefined,
      isETH: undefined,
      labelDataArray: [],
    })
  })
  describe('mocks', () => {
    it.each(mockUseValidateTypes)('should return expect value for %s ', (type) => {
      const config = mockUseValidateConfig[type]
      const { input } = config
      const { result } = renderHook(() => useValidate({ input }))
      const expected = makeMockUseValidate(type)
      expect(result.current).toEqual(expected)
    })
  })
})
