/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * BitGo API Environment URLs
 */
export const BITGO_ENVIRONMENTS = {
  production: 'https://app.bitgo.com/api/v2',
  test: 'https://app.bitgo-test.com/api/v2',
} as const;

export type BitGoEnvironment = keyof typeof BITGO_ENVIRONMENTS;

/**
 * Get the base URL for a BitGo environment
 */
export function getBaseUrl(environment: BitGoEnvironment): string {
  return BITGO_ENVIRONMENTS[environment];
}
