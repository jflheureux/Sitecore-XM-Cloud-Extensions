import { browser, $$, $, expect } from '@wdio/globals'
import type { Capabilities } from '@wdio/types'

const isFirefox = (browser.capabilities as Capabilities.Capabilities).browserName === 'firefox'

describe('Sitecore XM Cloud Extensions e2e test', () => {
})
