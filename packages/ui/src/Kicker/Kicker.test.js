import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '../test/render.js'
import Kicker from './Kicker.vue'

describe('Kicker', () => {
    beforeEach(() => {
        // Kicker schedules a real setTimeout (kickAfter * 60 * 1000 ms), so
        // drive it with fake timers to keep the test fast and deterministic.
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('emits "kicked" after the configured kickAfter window elapses', () => {
        const { emitted } = render(Kicker, {
            props: { kickAfter: 1 }, // 1 minute
        })

        // Not yet kicked.
        expect(emitted().kicked).toBeUndefined()

        // Advance just past 1 minute.
        vi.advanceTimersByTime(1 * 60 * 1000 + 1)

        expect(emitted().kicked).toBeDefined()
        expect(emitted().kicked).toHaveLength(1)
    })

    it('does not kick before the window elapses', () => {
        const { emitted } = render(Kicker, {
            props: { kickAfter: 5 },
        })

        vi.advanceTimersByTime(5 * 60 * 1000 - 1)

        expect(emitted().kicked).toBeUndefined()
    })

    it('reschedules the timer (does not kick) on user activity', () => {
        const { emitted } = render(Kicker, {
            props: { kickAfter: 2 },
        })

        // Halfway through, simulate activity -> timer restarts.
        vi.advanceTimersByTime(60 * 1000)
        window.dispatchEvent(new Event('mousedown'))

        // Advance another 60s: without the restart this would total 120s (kick),
        // but the restart pushed the deadline out, so no kick yet.
        vi.advanceTimersByTime(60 * 1000)
        expect(emitted().kicked).toBeUndefined()

        // Now pass the remaining time of the restarted window.
        vi.advanceTimersByTime(2 * 60 * 1000)
        expect(emitted().kicked).toBeDefined()
    })
})
