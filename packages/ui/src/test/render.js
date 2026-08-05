/**
 * Test render helper for @2fauth/ui.
 *
 * Components in this package call the vue-i18n `$t()` translation function
 * in their templates (e.g. SearchBox, Modal). The raw `render` from
 * @testing-library/vue does not install vue-i18n, so `$t` is undefined and
 * renders throw `_ctx.$t is not a function`.
 *
 * This wrapper installs a passthrough vue-i18n instance (returns the
 * message key unchanged) by default, unless the test passes its own
 * `global.plugins`. Snapshots stay stable and locale-independent.
 */

import { render as baseRender } from '@testing-library/vue'
import { createI18n } from 'vue-i18n'

const passthroughI18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'en',
    messages: { en: {} },
    missingWarn: false,
    fallbackWarn: false,
})

export function render(component, options = {}) {
    const global = options.global || {}
    const hasOwnPlugins = Array.isArray(global.plugins) && global.plugins.length > 0
    const plugins = hasOwnPlugins ? global.plugins : [...(global.plugins || []), passthroughI18n]
    return baseRender(component, { ...options, global: { ...global, plugins } })
}
