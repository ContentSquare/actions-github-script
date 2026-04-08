import {getOctokit} from '@actions/github'

/**
 * Creates a wrapped getOctokit that inherits default options and plugins.
 * Secondary clients created via the wrapper get the same retry, logging,
 * orchestration ID, and retries count as the pre-built `github` client.
 *
 * - `request` is deep-merged so partial overrides (e.g. `{request: {timeout: 5000}}`)
 *   don't clobber inherited `retries`, proxy agent, or fetch defaults.
 * - Default plugins (retry, requestLog) are always included; duplicates are skipped.
 */
export function createConfiguredGetOctokit(
  rawGetOctokit: typeof getOctokit,
  defaultOptions: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...defaultPlugins: any[]
): typeof getOctokit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((token: string, options?: any, ...plugins: any[]) => {
    const userOpts = options || {}

    const defaultRequest =
      (defaultOptions.request as Record<string, unknown> | undefined) ?? {}
    const userRequest =
      (userOpts.request as Record<string, unknown> | undefined) ?? {}

    const merged = {
      ...defaultOptions,
      ...userOpts,
      // Deep-merge `request` to preserve retries, proxy agent, and fetch
      request: {...defaultRequest, ...userRequest}
    }

    // Deduplicate: default plugins first, then user plugins that aren't already present
    const allPlugins = [...defaultPlugins]
    for (const plugin of plugins) {
      if (!allPlugins.includes(plugin)) {
        allPlugins.push(plugin)
      }
    }

    return rawGetOctokit(token, merged, ...allPlugins)
  }) as typeof getOctokit
}
