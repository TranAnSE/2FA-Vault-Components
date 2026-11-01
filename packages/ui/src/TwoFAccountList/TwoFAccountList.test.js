import { describe, expect, it } from 'vitest'
import { render } from '../test/render.js'
import TwoFAccountList from './TwoFAccountList.vue'

describe('TwoFAccountList', () => {
    it('renders a span wrapper with the dv sortable target in grid/list mode', () => {
        const { container } = render(TwoFAccountList, { props: {} })
        const wrapper = container.querySelector('span#dv')
        expect(wrapper).not.toBeNull()
        expect(wrapper.className).toContain('columns')
        expect(container.querySelector('table')).toBeNull()
    })

    it('applies is-centered when requested in grid/list mode', () => {
        const { container } = render(TwoFAccountList, { props: { isCentered: true } })
        expect(container.querySelector('span#dv').className).toContain('is-centered')
    })

    it('renders a table shell with a tbody dv target in table mode', () => {
        const { container } = render(TwoFAccountList, { props: { useDesktopTableLayout: true } })
        const table = container.querySelector('table.tfa-table')
        expect(table).not.toBeNull()
        expect(container.querySelector('tbody#dv')).not.toBeNull()
        expect(container.querySelector('span#dv')).toBeNull()
    })

    it('renders slotted items inside the active shell', () => {
        const { container } = render(TwoFAccountList, {
            props: { useDesktopTableLayout: true },
            slots: { default: '<tr><td>slotted-cell</td></tr>' },
        })
        expect(container.textContent).toContain('slotted-cell')
        expect(container.querySelector('tbody#dv tr')).not.toBeNull()
    })
})
