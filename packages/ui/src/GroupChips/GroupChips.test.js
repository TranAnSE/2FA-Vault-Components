import { describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import { render } from '../test/render.js'
import GroupChips from './GroupChips.vue'

function mountChips(props = {}) {
    return render(GroupChips, {
        props: {
            groups: [{ id: 1, name: 'Work', show_in_chips: true }],
            filteredCount: 3,
            ...props,
        },
    })
}

describe('GroupChips', () => {
    it('centers chips by default', () => {
        const { container } = mountChips()
        expect(container.querySelector('#groupChips').className).toContain('is-justify-content-center')
    })

    it('right-aligns chips with isRightAligned', () => {
        const { container } = mountChips({ isRightAligned: true })
        expect(container.querySelector('#groupChips').className).toContain('is-justify-content-right')
    })

    it('hides the favorites chip when useFavorites is false', () => {
        const { container } = mountChips()
        expect(container.querySelector('[title="tooltip.show_favorites_only"]')).toBeNull()
    })

    it('shows the favorites chip when useFavorites is true', () => {
        const { container } = mountChips({ useFavorites: true })
        expect(container.querySelector('[title="tooltip.show_favorites_only"]')).not.toBeNull()
    })

    it('toggles the showFavoritesOnly model when the star chip is clicked', async () => {
        const { container, emitted } = mountChips({ useFavorites: true })
        // The model starts unset; clicking the chip flips its value through the
        // v-model binding (showFavoritesOnly = !showFavoritesOnly => true).
        const chip = container.querySelector('[title="tooltip.show_favorites_only"]')
        await fireEvent.click(chip)
        expect(emitted()).toHaveProperty('update:showFavoritesOnly')
    })
})
