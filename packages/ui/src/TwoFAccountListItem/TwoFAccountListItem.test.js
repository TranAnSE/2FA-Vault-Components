import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/vue'
import { render } from '../test/render.js'
import TwoFAccountListItem from './TwoFAccountListItem.vue'

function makeAccount(overrides = {}) {
    return {
        id: 7,
        otp_type: 'totp',
        service: 'GitLab',
        account: 'bob@example.com',
        period: 30,
        counter: null,
        is_favorite: false,
        is_pinned: false,
        icon: null,
        is_shared: false,
        otp: { password: '654321', next_password: '765432' },
        ...overrides,
    }
}

function makePreferences(overrides = {}) {
    return {
        displayMode: 'list',
        enableFavorites: true,
        showAccountsIcons: true,
        getOtpOnRequest: false,
        showOtpAsDot: false,
        revealDottedOTP: false,
        showNextOtp: true,
        formatPassword: true,
        formatPasswordBy: 0.5,
        activeGroup: 0,
        ...overrides,
    }
}

function mountItem({ account = makeAccount(), preferences = makePreferences(), props = {} } = {}) {
    return render(TwoFAccountListItem, {
        props: { account, preferences, inManagementMode: false, ...props },
    })
}

describe('TwoFAccountListItem grid/list branch', () => {
    it('renders service and account', () => {
        mountItem()
        expect(screen.getByText('GitLab')).not.toBeNull()
        expect(screen.getByText('bob@example.com')).not.toBeNull()
    })

    it('renders a shared badge when the account is flagged shared', () => {
        const { container } = mountItem({ account: makeAccount({ is_shared: true }) })
        expect(container.querySelector('.tag')).not.toBeNull()
    })

    it('renders no shared badge for an own account', () => {
        const { container } = mountItem()
        expect(container.querySelector('.tag')).toBeNull()
    })

    it('hides the favorite star when preferences.enableFavorites is off', () => {
        const { container } = mountItem({ preferences: makePreferences({ enableFavorites: false }) })
        expect(container.innerHTML).not.toContain('set_as_favorite')
    })

    it('hides the favorite star when can_showFavorite is false', () => {
        const { container } = mountItem({ props: { can_showFavorite: false } })
        expect(container.innerHTML).not.toContain('set_as_favorite')
    })

    it('emits toggle-is-favorite when the star is clicked', async () => {
        const { emitted, container } = mountItem({ props: { inManagementMode: true } })
        const star = container.querySelector('[title="tooltip.set_as_favorite"]')
        expect(star).not.toBeNull()
        await fireEvent.click(star)
        expect(emitted()['toggle-is-favorite'][0]).toEqual([7])
    })

    it('emits toggle-pin through the fork-cell contract', async () => {
        const { emitted, container } = mountItem({ props: { isPinned: false } })
        const pin = container.querySelector('.tfa-pin')
        expect(pin).not.toBeNull()
        await fireEvent.click(pin)
        expect(emitted()['toggle-pin'][0]).toEqual([7])
    })

    it('shows reveal buttons per the fork-cell revealed prop and emits toggle-reveal', async () => {
        const { emitted, container } = mountItem({
            preferences: makePreferences({ showOtpAsDot: true, revealDottedOTP: true }),
            props: { revealed: false },
        })
        const reveal = container.querySelector('.button.is-ghost svg')
        expect(reveal).not.toBeNull()
        await fireEvent.click(reveal.closest('button'))
        expect(emitted()['toggle-reveal'][0]).toEqual([7])
    })

    it('renders tags and vault badge props (render-only)', () => {
        const { container } = mountItem({ props: { tags: ['work', 'personal'], vaultBadge: 'Vault A' } })
        expect(container.textContent).toContain('work')
        expect(container.textContent).toContain('Vault A')
    })

    it('renders the always-on OTP value', () => {
        const { container } = mountItem()
        // formatPassword defaults on: digits render space-grouped
        expect(container.textContent).toContain('654 321')
    })

    it('emits copy-to-clipboard when the always-on OTP is clicked', async () => {
        const { emitted, container } = mountItem()
        const otp = container.querySelector('.always-on-otp')
        await fireEvent.click(otp)
        expect(emitted()['copy-to-clipboard'][0]).toEqual(['654321'])
    })
})

describe('TwoFAccountListItem table branch', () => {
    it('renders table rows when useDesktopTableLayout is set', () => {
        const { container } = mountItem({ props: { useDesktopTableLayout: true } })
        expect(container.querySelector('tr.tfa-table')).not.toBeNull()
        expect(container.querySelectorAll('td').length).toBeGreaterThan(3)
    })

    it('emits delete-account-clicked in management mode', async () => {
        const { emitted, container } = mountItem({ props: { useDesktopTableLayout: true, inManagementMode: true } })
        const del = container.querySelector('button.tag')
        await fireEvent.click(del)
        expect(emitted()['delete-account-clicked'][0]).toEqual([7])
    })

    it('offers get-and-copy in table mode when OTP is fetched on request', async () => {
        const { emitted, getByText } = mountItem({
            preferences: makePreferences({ getOtpOnRequest: true }),
            props: { useDesktopTableLayout: true },
        })
        await fireEvent.click(getByText('label.get_and_copy'))
        expect(emitted()['get-and-copy-otp']).toBeTruthy()
    })
})
