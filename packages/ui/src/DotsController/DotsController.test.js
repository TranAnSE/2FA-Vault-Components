import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render } from '../test/render.js'
import DotsController from './DotsController.vue'

describe('DotsController', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('starts stepping and ends at the period boundary for a valid generated_at', () => {
        const handlers = {
            onSteppingStarted: vi.fn(),
            onSteppingEnded: vi.fn(),
            onSteppedUp: vi.fn(),
        }

        render(DotsController, {
            props: {
                period: 30,
                step_count: 10,
                generated_at: 1_700_000_000,
                autostart: true,
            },
            attrs: handlers,
        })

        expect(handlers.onSteppingStarted).toHaveBeenCalledTimes(1)

        // Advancing past one full period must fire stepping-ended.
        vi.advanceTimersByTime(30 * 1000 + 1)
        expect(handlers.onSteppingEnded).toHaveBeenCalledTimes(1)
    })

    it('does not arm timers when generated_at is undefined', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const handlers = {
            onSteppingStarted: vi.fn(),
            onSteppingEnded: vi.fn(),
            onSteppedUp: vi.fn(),
        }

        render(DotsController, {
            props: {
                period: 30,
                step_count: 10,
                // generated_at intentionally omitted
                autostart: true,
            },
            attrs: handlers,
        })

        expect(handlers.onSteppingStarted).not.toHaveBeenCalled()

        // No NaN-scheduled timer should ever fire.
        vi.advanceTimersByTime(60 * 1000)
        expect(handlers.onSteppingEnded).not.toHaveBeenCalled()
        expect(handlers.onSteppedUp).not.toHaveBeenCalled()
        expect(console.warn).toHaveBeenCalled()
    })

    it('does not arm timers when generated_at is 0', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const handlers = {
            onSteppingStarted: vi.fn(),
            onSteppingEnded: vi.fn(),
            onSteppedUp: vi.fn(),
        }

        render(DotsController, {
            props: {
                period: 30,
                step_count: 10,
                generated_at: 0,
                autostart: true,
            },
            attrs: handlers,
        })

        expect(handlers.onSteppingStarted).not.toHaveBeenCalled()

        vi.advanceTimersByTime(60 * 1000)
        expect(handlers.onSteppingEnded).not.toHaveBeenCalled()
        expect(handlers.onSteppedUp).not.toHaveBeenCalled()
    })

    it('does not arm timers when generated_at is not a finite number', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const handlers = {
            onSteppingStarted: vi.fn(),
            onSteppingEnded: vi.fn(),
            onSteppedUp: vi.fn(),
        }

        // NaN bypasses the Number prop check at runtime, as does any garbage
        // coerced value coming from a consumer.
        render(DotsController, {
            props: {
                period: 30,
                step_count: 10,
                generated_at: NaN,
                autostart: true,
            },
            attrs: handlers,
        })

        expect(handlers.onSteppingStarted).not.toHaveBeenCalled()

        vi.advanceTimersByTime(60 * 1000)
        expect(handlers.onSteppingEnded).not.toHaveBeenCalled()
        expect(handlers.onSteppedUp).not.toHaveBeenCalled()
    })
})
