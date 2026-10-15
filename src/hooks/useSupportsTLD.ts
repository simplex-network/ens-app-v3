import { getTldFromName } from '@app/utils/utils'

import { useDnsSecEnabled } from './dns/useDnsSecEnabled'

export const useSupportsTLD = (name = '') => {
  const tld = getTldFromName(name)
  const { data: isDnsSecEnabled, ...query } = useDnsSecEnabled({ name: tld })
  return {
    data:
      tld === (process.env.NEXT_PUBLIC_SIMPLEX_TLD || 'testing') ||
      tld === '[root]' ||
      isDnsSecEnabled,
    ...query,
  }
}
