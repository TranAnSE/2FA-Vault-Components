import { describe, expect, it, vi, beforeEach } from 'vitest'

const notifySpy = vi.fn()

vi.mock('@kyvg/vue3-notification', () => ({
    useNotification: () => ({ notify: notifySpy }),
}))

import { useNotify } from './useNotify'

describe('useNotify', () => {
    beforeEach(() => {
        notifySpy.mockClear()
    })

    it('exposes an error method alongside the legacy API', () => {
        const notify = useNotify()

        expect(typeof notify.error).toBe('function')
        expect(typeof notify.info).toBe('function')
        expect(typeof notify.success).toBe('function')
        expect(typeof notify.warn).toBe('function')
        expect(typeof notify.alert).toBe('function')
        expect(typeof notify.action).toBe('function')
        expect(typeof notify.clear).toBe('function')
    })

    it('dispatches a notification with the is-danger severity', () => {
        const notify = useNotify()

        notify.error({ text: 'Something went wrong' })

        expect(notifySpy).toHaveBeenCalledTimes(1)
        expect(notifySpy).toHaveBeenCalledWith({
            type: 'is-danger',
            text: 'Something went wrong',
        })
    })

    it('matches the alert() severity semantics', () => {
        const notify = useNotify()

        notify.alert({ text: 'a' })
        notify.error({ text: 'a' })

        expect(notifySpy).toHaveBeenNthCalledWith(1, { type: 'is-danger', text: 'a' })
        expect(notifySpy).toHaveBeenNthCalledWith(2, { type: 'is-danger', text: 'a' })
    })

    it('does not dispatch when clear() is called', () => {
        const notify = useNotify()

        notify.clear()

        expect(notifySpy).toHaveBeenCalledWith({ clean: true })
    })
})
