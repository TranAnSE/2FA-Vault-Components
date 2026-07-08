import { fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { render } from '../test/render.js'
import VueButton from './VueButton.vue'

describe('button', () => {
    it('should emit a click event when clicked', async () => {
        const { emitted } = render(VueButton, { props: { label: 'label', nativeType: 'button' }})

        await fireEvent.click(screen.getByText('label'))

        expect(emitted()).toMatchInlineSnapshot(`
      {
        "click": [
          [
            MouseEvent {
              "isTrusted": false,
            },
          ],
        ],
      }
    `)
    })

    it('should render with .button class', () => {
        const button = render(VueButton, { props: { nativeType: 'button' }})

        expect(button.html()).toMatchSnapshot()
    })

    describe('color', () => {
        it('should render with .is-link class by default', () => {
            const button = render(VueButton, { props: { nativeType: 'button' }})

            expect(button.html()).toMatchSnapshot()
        })

        it('should render with passed css class', () => {
            const button = render(VueButton, { props: { nativeType: 'button', color: 'is-success' }})

            expect(button.html()).toMatchSnapshot()
        })
    })

    describe('label', () => {
        it('should render a default label with bracket', () => {
            const button = render(VueButton, { props: { nativeType: 'button' }})

            expect(button.html()).toMatchSnapshot()
        })

        it('should render passed label', () => {
            const button = render(VueButton, { props: { label: 'label', nativeType: 'button' }})

            expect(button.html()).toMatchSnapshot()
        })
    })

    describe('state', () => {
        it('should render as loading', () => {
            const button = render(VueButton, { props: { nativeType: 'button', isLoading: true }})

            expect(button.html()).toMatchSnapshot()
        })

        it('should render as disabled', () => {
            const button = render(VueButton, { props: { nativeType: 'button', isDisabled: true }})

            expect(button.html()).toMatchSnapshot()
        })
    })
})