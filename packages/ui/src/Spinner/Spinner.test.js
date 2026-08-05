import { describe, expect, it } from 'vitest'
import { render } from '../test/render.js'
import Spinner from './Spinner.vue'

describe('Spinner', () => {
    it('renders nothing when isVisible is false', () => {
        const { container } = render(Spinner, {
            props: { isVisible: false, type: 'raw' },
        })

        expect(container.querySelector('.spinner')).toBeNull()
        // The v-if="isVisible" wrapper renders no children.
        expect(container.firstElementChild).toBeNull()
    })

    it('renders the raw spinner (an svg loader) when type is raw', () => {
        const { container } = render(Spinner, {
            props: { isVisible: true, type: 'raw' },
        })

        // The raw variant renders the Lucide loader svg directly with the
        // 'spinning' class, wrapped in no container div.
        const svg = container.querySelector('.spinning')
        expect(svg).not.toBeNull()
        expect(container.querySelector('.spinner-container')).toBeNull()
    })

    it('renders the fullscreen container and message when type is fullscreen', () => {
        const { container, getByText } = render(Spinner, {
            props: { isVisible: true, type: 'fullscreen', message: 'common.loading' },
        })

        expect(container.querySelector('.spinner-container')).not.toBeNull()
        // The message is passed through $t() (passthrough -> the key itself).
        expect(getByText('common.loading')).toBeDefined()
    })

    it('renders the overlay container when type is fullscreen-overlay', () => {
        const { container } = render(Spinner, {
            props: { isVisible: true, type: 'fullscreen-overlay', message: 'x' },
        })

        expect(container.querySelector('.spinner-overlay-container')).not.toBeNull()
        expect(container.querySelector('.spinner-container')).toBeNull()
    })

    it('renders the list-loading variant when type is list-loading', () => {
        const { container } = render(Spinner, {
            props: { isVisible: true, type: 'list-loading' },
        })

        expect(container.querySelector('#icnSpinner')).not.toBeNull()
    })
})
