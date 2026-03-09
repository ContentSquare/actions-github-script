/* eslint-disable @typescript-eslint/no-explicit-any */

import {callAsyncFunction} from '../src/async-function'

describe('callAsyncFunction', () => {
  test('calls the function with its arguments', async () => {
    const result = await callAsyncFunction({foo: 'bar'} as any, 'return foo')
    expect(result).toEqual('bar')
  })

  test('passes getOctokit through the script context', async () => {
    const getOctokit = jest.fn().mockReturnValue('secondary-client')

    const result = await callAsyncFunction(
      {getOctokit} as any,
      "return getOctokit('token')"
    )

    expect(getOctokit).toHaveBeenCalledWith('token')
    expect(result).toEqual('secondary-client')
  })

  test('throws on ReferenceError', async () => {
    expect.assertions(1)

    try {
      await callAsyncFunction({} as any, 'proces')
    } catch (err) {
      expect(err).toBeInstanceOf(ReferenceError)
    }
  })

  test('can access process', async () => {
    await callAsyncFunction({} as any, 'process')
  })

  test('can access console', async () => {
    await callAsyncFunction({} as any, 'console')
  })
})
