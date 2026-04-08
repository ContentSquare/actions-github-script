/* eslint-disable @typescript-eslint/no-explicit-any */

import {getOctokit} from '@actions/github'
import {callAsyncFunction} from '../src/async-function'

describe('createOctokit integration via callAsyncFunction', () => {
  test('real getOctokit creates a functional Octokit client in script scope', async () => {
    const result = await callAsyncFunction(
      {createOctokit: getOctokit} as any,
      `
        const client = createOctokit('fake-token-for-test')
        return {
          hasRest: typeof client.rest === 'object',
          hasGraphql: typeof client.graphql === 'function',
          hasRequest: typeof client.request === 'function',
          hasIssues: typeof client.rest.issues === 'object',
          hasPulls: typeof client.rest.pulls === 'object'
        }
      `
    )

    expect(result).toEqual({
      hasRest: true,
      hasGraphql: true,
      hasRequest: true,
      hasIssues: true,
      hasPulls: true
    })
  })

  test('secondary client is independent from primary github client', async () => {
    const primary = getOctokit('primary-token')

    const result = await callAsyncFunction(
      {github: primary, createOctokit: getOctokit} as any,
      `
        const secondary = createOctokit('secondary-token')
        return {
          bothHaveRest: typeof github.rest === 'object' && typeof secondary.rest === 'object',
          areDistinct: github !== secondary
        }
      `
    )

    expect(result).toEqual({
      bothHaveRest: true,
      areDistinct: true
    })
  })

  test('createOctokit accepts options for GHES base URL', async () => {
    const result = await callAsyncFunction(
      {createOctokit: getOctokit} as any,
      `
        const client = createOctokit('fake-token', {
          baseUrl: 'https://ghes.example.com/api/v3'
        })
        return typeof client.rest === 'object'
      `
    )

    expect(result).toBe(true)
  })

  test('multiple createOctokit calls produce independent clients with different tokens', async () => {
    const result = await callAsyncFunction(
      {createOctokit: getOctokit} as any,
      `
        const clientA = createOctokit('token-a')
        const clientB = createOctokit('token-b')
        return {
          aHasRest: typeof clientA.rest === 'object',
          bHasRest: typeof clientB.rest === 'object',
          areDistinct: clientA !== clientB
        }
      `
    )

    expect(result).toEqual({
      aHasRest: true,
      bHasRest: true,
      areDistinct: true
    })
  })
})
