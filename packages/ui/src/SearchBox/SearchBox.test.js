import { fireEvent, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { render } from '../test/render.js'
import SearchBox from './SearchBox.vue'

describe('SearchBox', () => {
    // The component wraps the <input> in a <div role="search">, so query the
    // input by id rather than by role to avoid the wrapper/input ambiguity.
    const input = () => screen.getByLabelText(/search/i, { selector: 'input' })

    it('renders a search input with the placeholder prop', () => {
        render(SearchBox, {
            props: { placeholder: 'Find an account' },
        })

        expect(input().placeholder).toBe('Find an account')
    })

    it('binds the keyword via v-model', async () => {
        const { rerender } = render(SearchBox, {
            props: { keyword: 'github', placeholder: 'x' },
        })

        expect(input().value).toBe('github')

        // Editing the input updates the model.
        await fireEvent.update(input(), 'gitlab')
        expect(input().value).toBe('gitlab')
    })

    it('shows the clear button when a keyword is set, hides it when empty', async () => {
        // The component uses `v-if="keyword != ''"`, so the clear button is
        // shown for any non-empty-string value (including undefined initially).
        // Drive it through the model to verify the empty/non-empty transition.
        const { queryByTitle } = render(SearchBox, {
            props: { keyword: 'aws', placeholder: 'x' },
        })

        // Keyword set -> clear button visible.
        expect(queryByTitle(/clear/i)).not.toBeNull()

        // Clear via the model -> button disappears.
        await fireEvent.update(input(), '')
        expect(queryByTitle(/clear/i)).toBeNull()
    })

    it('emits "cleared" and empties the input when the clear button is clicked', async () => {
        const { getByTitle, emitted } = render(SearchBox, {
            props: { keyword: 'github', placeholder: 'x' },
        })

        await fireEvent.click(getByTitle(/clear/i))

        expect(input().value).toBe('')
        expect(emitted()).toHaveProperty('cleared')
    })

    it('emits "cleared" and empties the input on Escape', async () => {
        const { emitted } = render(SearchBox, {
            props: { keyword: 'github', placeholder: 'x' },
        })

        await fireEvent.keyUp(input(), { key: 'Escape' })

        expect(input().value).toBe('')
        expect(emitted()).toHaveProperty('cleared')
    })

    it('applies the is-small and has-no-background modifier classes', () => {
        render(SearchBox, {
            props: { isSmall: true, hasNoBackground: true, placeholder: 'x' },
        })

        const cls = input().className
        expect(cls).toContain('is-small')
        expect(cls).toContain('has-no-background')
    })
})
