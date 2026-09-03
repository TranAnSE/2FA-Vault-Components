import { describe, expect, it, vi, beforeEach } from 'vitest'
import { h, ref } from 'vue'

// Controllable clipboard doubles: OtpDisplay must test the *value* of the
// `copied` ref returned by useClipboard, not the ref object itself.
const clipboardState = {
    copied: ref(false),
    copy: vi.fn(),
}

vi.mock('@vueuse/core', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useClipboard: () => ({
            copy: clipboardState.copy,
            copied: clipboardState.copied,
        }),
    }
})

// jsdom has no matchMedia; replace UseColorMode with a passthrough slot.
vi.mock('@vueuse/components', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        UseColorMode: {
            name: 'UseColorMode',
            setup(_, { slots }) {
                return () => h('div', slots.default ? slots.default({ mode: 'light' }) : [])
            },
        },
    }
})

import { fireEvent } from '@testing-library/vue'
import { render } from '../test/render.js'
import OtpDisplay from './OtpDisplay.vue'

const preferences = {
    formatPassword: false,
    formatPasswordBy: 3,
    showOtpAsDot: false,
    copyOtpOnDisplay: false,
    getOtpOnRequest: false,
    autoCloseTimeout: 0,
    kickUserAfter: -1,
    closeOtpOnCopy: false,
    clearSearchOnCopy: false,
    viewDefaultGroupOnCopy: false,
    showNextOtp: true,
}

const twofaccountService = {
    get: vi.fn(),
    getOtpById: vi.fn(),
    getOtpByUri: vi.fn(),
    getOtpByParams: vi.fn(),
}

function renderOtpDisplay(handlers = {}) {
    return render(OtpDisplay, {
        props: {
            twofaccountService,
            preferences,
            can_showNextOtp: false,
            ...handlers,
        },
    })
}

describe('OtpDisplay copy feedback', () => {
    beforeEach(() => {
        clipboardState.copied.value = false
        clipboardState.copy.mockReset()
    })

    it('does NOT emit copy-linked events when the clipboard copy failed', async () => {
        const onCopied = vi.fn()
        const onPleaseClearSearch = vi.fn()
        const onKickme = vi.fn()

        const { container } = renderOtpDisplay({
            onOtpCopiedToClipboard: onCopied,
            onPleaseClearSearch: onPleaseClearSearch,
            onKickme: onKickme,
        })

        // copied.value === false simulates a failed copy (e.g. clipboard
        // permission denied). The ref OBJECT is still truthy, so a bug that
        // tests `if (copied)` would wrongly run the success branch here.
        clipboardState.copied.value = false

        await fireEvent.click(container.querySelector('#otp'))

        expect(clipboardState.copy).toHaveBeenCalledTimes(1)
        expect(onCopied).not.toHaveBeenCalled()
        expect(onPleaseClearSearch).not.toHaveBeenCalled()
        expect(onKickme).not.toHaveBeenCalled()
    })

    it('emits otp-copied-to-clipboard when the copy succeeded', async () => {
        const onCopied = vi.fn()

        const { container } = renderOtpDisplay({
            onOtpCopiedToClipboard: onCopied,
        })

        clipboardState.copied.value = true

        await fireEvent.click(container.querySelector('#otp'))

        expect(clipboardState.copy).toHaveBeenCalledTimes(1)
        expect(onCopied).toHaveBeenCalledTimes(1)
    })
})
