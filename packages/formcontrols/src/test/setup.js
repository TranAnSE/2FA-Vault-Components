/**
 * Global Vitest setup for @2fauth/formcontrols.
 *
 * Adds automatic DOM cleanup after each test. The shared passthrough
 * vue-i18n instance is provided through the wrapper in `./render.js` —
 * see that file for why components that call `$t()` need it.
 */

import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/vue'

afterEach(() => {
    cleanup()
})
