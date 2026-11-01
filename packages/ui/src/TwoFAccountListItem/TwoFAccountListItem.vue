<script setup>
    import { computed } from 'vue'
    import { useVisiblePassword } from '../useVisiblePassword'
    import { LucideCircleAlert, LucideEye, LucideEyeOff, LucideMenu, LucidePin, LucideQrCode, LucideSquarePen, LucideStar, LucideTrash2, LucideUserCheck } from '@lucide/vue';

    const selectedTwofaccountIds = defineModel('selectedTwofaccountIds')

    const props = defineProps({
        useDesktopTableLayout: {
            type: Boolean,
            default: false,
        },
        storageRootPath: {
            type: String,
            default: '',
        },
        colorScheme: {
            type: String,
            default: 'dark',
        },
        inManagementMode: {
            type: Boolean,
            default: true,
        },
        // Gate for the favorite star, on top of preferences.enableFavorites
        // (the extension passes its own feature gate through this prop).
        can_showFavorite: {
            type: Boolean,
            default: true,
        },
        nextOtpOpacityClass: {
            type: String,
            default: 'is-opacity-0',
        },
        preferences: {
            type: Object,
            default(rawProps) {
                return {
                    displayMode: 'list',
                    enableFavorites: true,
                    showAccountsIcons: true,
                    getOtpOnRequest: true,
                    showOtpAsDot: false,
                    revealDottedOTP: false,
                    showNextOtp: true,
                    formatPassword: true,
                    formatPasswordBy: 0.5,
                    activeGroup: 0,
                }
            }
        },
        account: {
            type: Object,
            default(rawProps) {
                return {
                    id: null,
                    otp_type: 'totp',
                    service: '',
                    account: '',
                    period: null,
                    counter: null,
                    is_favorite: false,
                    is_pinned: false,
                    icon: '',
                    is_shared: false,
                    otp: {
                        password: '',
                        next_password: ''
                    },
                }
            }
        },
        // Fork-only per-row cells (fork-cell slot/prop contract).
        // tags/vaultBadge are render-only data; pin and reveal delegate the
        // state mutation to the consumer through emits so the consumer keeps
        // a single owner (its own refs/store) across all rows.
        isPinned: {
            type: Boolean,
            default: false,
        },
        revealed: {
            type: Boolean,
            default: false,
        },
        tags: {
            type: Array,
            default: () => [],
        },
        vaultBadge: {
            type: String,
            default: '',
        },
    })

    const emit = defineEmits([
        'update:selected-twofaccount-ids',
        'show-or-copy',
        'get-and-copy-otp',
        'copy-to-clipboard',
        'toggle-is-favorite',
        'toggle-pin',
        'toggle-reveal',
        'show-otp',
        'delete-account-clicked'
    ])

    const buttonColor = computed(() => {
        return props.colorScheme == 'dark' ? 'is-dark' : 'is-white'
    })

    const shareTagClass = computed(() => {
        return props.colorScheme == 'dark' ? 'tag is-black is-opacity-4':'tag is-light is-white'
    })

    /**
     * Keyboard-accessible toggle for the selection model
     */
    function selectAccount(id) {
        const ids = selectedTwofaccountIds.value ?? []
        selectedTwofaccountIds.value = ids.includes(id)
            ? ids.filter(selected => selected !== id)
            : [...ids, id]
    }

    const canReveal = computed(() => {
        return props.account.otp_type.includes('totp') && props.preferences.showOtpAsDot && props.preferences.revealDottedOTP
    })

    const canShowStar = computed(() => {
        return props.account.id && props.can_showFavorite && props.preferences.enableFavorites
    })
</script>

<template>
    <div v-if="! useDesktopTableLayout" :class="[props.preferences.displayMode === 'grid' ? 'tfa-grid' : 'tfa-list']" class="column is-narrow">
        <div class="tfa-container">
            <!-- checkbox + favorite star (management mode) -->
            <transition name="slideCheckbox">
                <div class="tfa-min-height is-size-4-mobile is-size-3" v-if="props.inManagementMode">
                    <span v-if="canShowStar" class="tfa-checkradio">
                        <input class="is-checkradio is-small" :class="props.colorScheme == 'dark' ? 'is-white':'is-info'" :id="'ckb_' + props.account.id" :value="props.account.id" type="checkbox" :name="'ckb_' + props.account.id" v-model="selectedTwofaccountIds"  />
                        <label tabindex="0" class="" :for="'ckb_' + props.account.id" v-on:keypress.space.prevent="selectAccount(props.account.id)"></label>
                    </span>
                    <div v-else-if="props.inManagementMode" class="tfa-cell tfa-checkbox">
                        <div class="field">
                            <input class="is-checkradio is-small" :class="props.colorScheme == 'dark' ? 'is-white':'is-info'" :id="'ckb_' + props.account.id" :value="props.account.id" type="checkbox" :name="'ckb_' + props.account.id" v-model="selectedTwofaccountIds"  />
                            <label tabindex="0" :for="'ckb_' + props.account.id" v-on:keypress.space.prevent="selectAccount(props.account.id)"></label>
                        </div>
                    </div>
                    <span v-if="canShowStar" class="is-block is-size-6 is-size-7-mobile" role="button">
                        <LucideStar v-if="props.account.is_favorite" class="is-clickable" :class="props.colorScheme == 'dark' ? 'has-text-warning-dark' : 'has-text-warning-dark-invert'" @click="$emit('toggle-is-favorite', props.account.id)" :strokeWidth="1" fill="#ffb400" :title="$t('tooltip.remove_from_favorites')" />
                        <LucideStar v-else class="is-clickable" :class="props.colorScheme == 'dark' ? 'has-text-grey-dark' : 'has-text-grey-light'" @click="$emit('toggle-is-favorite', props.account.id)" :strokeWidth="1" :fill="colorScheme == 'dark' ? '#111' : '#f5f5f5'" :title="$t('tooltip.set_as_favorite')" />
                    </span>
                </div>
                <div class="tfa-cell tfa-checkbox" v-else-if="props.inManagementMode">
                    <div class="field">
                        <input class="is-checkradio is-small" :class="props.colorScheme == 'dark' ? 'is-white':'is-info'" :id="'ckb_' + props.account.id" :value="props.account.id" type="checkbox" :name="'ckb_' + props.account.id" v-model="selectedTwofaccountIds"  />
                        <label tabindex="0" :for="'ckb_' + props.account.id" v-on:keypress.space.prevent="selectAccount(props.account.id)"></label>
                    </div>
                </div>
            </transition>
            <!-- Account, service, badges -->
            <div tabindex="0" class="tfa-cell tfa-content is-size-3 is-size-4-mobile" @click.exact="$emit('show-or-copy', account)" @keyup.enter="$emit('show-or-copy', account)" @click.ctrl="$emit('get-and-copy-otp', account)" role="button">
                <div class="tfa-text has-ellipsis is-clickable">
                    <img v-if="props.account.icon && props.preferences.showAccountsIcons" role="presentation" class="tfa-icon" :src="storageRootPath + '/storage/icons/' + props.account.icon" alt="">
                    <img v-else-if="props.account.icon == null && props.preferences.showAccountsIcons" role="presentation" class="tfa-icon" :src="storageRootPath + '/storage/noicon.svg'" alt="">
                    {{ props.account.service ? props.account.service : $t('message.no_service') }}<LucideCircleAlert class="has-text-danger ml-2" v-if="props.account.account === $t('error.indecipherable')" />
                    <span class="is-block has-ellipsis is-family-primary is-size-6 is-size-7-mobile has-text-grey ">
                        <span v-if="props.account.is_shared" :title="$t('tooltip.shared_with_me')" class="p-1 mr-1" :class="shareTagClass" >
                            <LucideUserCheck class="icon-size-0-75" />
                        </span>
                        {{ props.account.account }}
                    </span>
                </div>
            </div>
            <!-- reveal password button -->
            <transition name="popLater" v-if="canReveal">
                <div v-show="props.preferences.getOtpOnRequest == false && !props.inManagementMode" class="has-text-right">
                    <button v-if="props.revealed" type="button" class="pr-0 button is-ghost has-text-grey-dark" @click.stop="$emit('toggle-reveal', props.account.id)">
                        <LucideEye />
                    </button>
                    <button v-else type="button" class="pr-0 button is-ghost has-text-grey-dark" @click.stop="$emit('toggle-reveal', props.account.id)">
                        <LucideEyeOff />
                    </button>
                </div>
            </transition>
            <!-- always On TOTP or HOTP button -->
            <transition name="popLater">
                <div v-show="props.preferences.getOtpOnRequest == false && !props.inManagementMode" :class="{'has-text-right': props.preferences.displayMode == 'list'}">
                    <template v-if="props.account.otp != undefined">
                        <div class="always-on-otp is-clickable has-nowrap has-text-grey is-size-5" :class="{'mt-4': props.preferences.displayMode == 'grid', 'ml-4': props.preferences.displayMode != 'grid', 'pt-2': props.preferences.showNextOtp}" @click="$emit('copy-to-clipboard', props.account.otp.password)" @keyup.enter="$emit('copy-to-clipboard', props.account.otp.password)"  :style="{ 'lineHeight': props.preferences.showNextOtp ? '1rem' : 'inherit'}" :title="$t('tooltip.copy_to_clipboard')">
                            {{ useVisiblePassword(
                                    props.account.otp.password,
                                    props.preferences.formatPassword,
                                    props.preferences.formatPasswordBy,
                                    props.preferences.showOtpAsDot,
                                    props.preferences.revealDottedOTP && props.revealed
                                )
                            }}
                        </div>
                        <div v-if="props.account.otp_type.includes('totp')" class="has-nowrap" :style="{ 'lineHeight': props.preferences.showNextOtp ? '1rem' : 'inherit'}">
                            <slot name="dots" />
                        </div>
                        <div v-if="props.preferences.showNextOtp" class="has-nowrap pt-1" style="line-height: .8rem">
                            <span class="always-on-otp is-clickable has-nowrap has-text-grey is-size-7" :class="nextOtpOpacityClass" @click="$emit('copy-to-clipboard', props.account.otp.next_password)" @keyup.enter="$emit('copy-to-clipboard', props.account.otp.next_password)" :title="$t('tooltip.copy_next_password')">
                                {{ useVisiblePassword(
                                        props.account.otp.next_password,
                                        props.preferences.formatPassword,
                                        props.preferences.formatPasswordBy,
                                        props.preferences.showOtpAsDot,
                                        props.preferences.revealDottedOTP && props.revealed
                                    )
                                }}
                            </span>
                        </div>
                    </template>
                    <div v-else :class="{'mt-5': props.preferences.displayMode == 'grid'}">
                        <!-- get hotp button -->
                        <button type="button" class="button tag" :class="buttonColor" @click="$emit('show-otp', account)" :title="$t('tooltip.import_this_account')">
                            {{ $t('label.generate') }}
                        </button>
                    </div>
                </div>
            </transition>
            <!-- pin toggle (fork-cell contract: state owned by the consumer; the fork does not gate the pin on the favorites feature) -->
            <transition name="fadeInOut">
                <button v-if="!props.inManagementMode" type="button" class="tfa-cell tfa-pin button is-ghost pr-0" :class="{ 'has-text-warning': props.isPinned, 'has-text-grey': !props.isPinned }" :title="$t('tooltip.toggle_pin')" @click.stop="$emit('toggle-pin', props.account.id)" :aria-label="$t('tooltip.toggle_pin')">
                    <LucidePin />
                </button>
            </transition>
            <!-- favorite toggle (fork: its own cell when not in management mode) -->
            <transition name="fadeInOut">
                <button v-if="!props.inManagementMode && canShowStar" type="button" class="tfa-cell tfa-favorite button is-ghost pr-0" :class="{ 'has-text-warning': props.account.is_favorite, 'has-text-grey': !props.account.is_favorite }" :title="$t('tooltip.toggle_favorite')" @click.stop="$emit('toggle-is-favorite', props.account.id)" :aria-label="$t('tooltip.toggle_favorite')">
                    <LucideStar :fill="props.account.is_favorite ? '#ffb400' : 'none'" :stroke-width="1.5" />
                </button>
            </transition>
            <!-- tags + vault badge (fork-cell contract: render-only) -->
            <transition name="fadeInOut">
                <div v-if="props.tags.length || props.vaultBadge" class="tfa-cell has-text-grey is-flex is-flex-direction-column is-align-items-flex-start">
                    <span v-for="tag in props.tags" :key="tag" class="tag p-1 mb-1" :class="shareTagClass">{{ tag }}</span>
                    <span v-if="props.vaultBadge" class="tag p-1" :class="shareTagClass">{{ props.vaultBadge }}</span>
                </div>
            </transition>
            <!-- Manage mode buttons -->
            <transition name="fadeInOut">
                <div class="tfa-cell tfa-edit has-text-grey" v-if="props.inManagementMode">
                    <!-- edit button -->
                    <router-link :to="{ name: 'editAccount', params: { twofaccountId: props.account.id }}" class="tag is-rounded mr-1" :class="buttonColor">
                        {{ $t('link.edit') }}
                    </router-link>
                    <!-- show qrcode button -->
                    <router-link :to="{ name: 'showQRcode', params: { twofaccountId: props.account.id }}" class="tag is-rounded mr-1" :class="buttonColor" :title="$t('tooltip.show_qrcode')">
                        <LucideQrCode class="icon-size-1" />
                    </router-link>
                    <!-- delete button -->
                    <button @click="$emit('delete-account-clicked', props.account.id)" class="tag is-rounded" :class="buttonColor" :title="$t('tooltip.delete_account')">
                        <LucideTrash2 class="icon-size-1" />
                    </button>
                </div>
            </transition>
            <!-- drag handle -->
            <transition name="fadeInOut">
                <div class="drag-handle tfa-cell tfa-dots has-text-grey" v-if="props.inManagementMode">
                    <LucideMenu />
                </div>
            </transition>
        </div>
    </div>
    <tr v-else class="tfa-table">
        <!-- checkbox -->
        <td class="is-narrow pr-0">
            <span class="tfa-checkradio">
                <input class="is-checkradio is-small" :class="props.colorScheme == 'dark' ? 'is-white':'is-info'" :id="'ckb_' + props.account.id" :value="props.account.id" type="checkbox" :name="'ckb_' + props.account.id" v-model="selectedTwofaccountIds"  />
                <label tabindex="0" class="mr-0 pr-0" :for="'ckb_' + props.account.id" v-on:keypress.space.prevent="selectAccount(props.account.id)"></label>
            </span>
        </td>
        <!-- favorite -->
        <td v-if="canShowStar" class="is-narrow pr-0">
            <button class="button is-ghost px-0">
                <LucideStar v-if="props.account.is_favorite" class="is-clickable" :class="props.colorScheme == 'dark' ? 'has-text-warning-dark' : 'has-text-warning-dark-invert'" @click="$emit('toggle-is-favorite', props.account.id)" :strokeWidth="1" fill="#ffb400" :title="$t('tooltip.remove_from_favorites')" />
                <LucideStar v-else class="is-clickable" :class="props.colorScheme == 'dark' ? 'has-text-grey-dark' : 'has-text-grey-light'" @click="$emit('toggle-is-favorite', props.account.id)" :strokeWidth="1" :fill="colorScheme == 'dark' ? '#111' : '#f5f5f5'" :title="$t('tooltip.set_as_favorite')" />
            </button>
        </td>
        <!-- pin -->
        <td class="is-narrow">
            <button v-if="!props.inManagementMode" type="button" class="button is-ghost px-0" :class="{ 'has-text-warning': props.isPinned, 'has-text-grey': !props.isPinned }" :title="$t('tooltip.toggle_pin')" @click.stop="$emit('toggle-pin', props.account.id)" :aria-label="$t('tooltip.toggle_pin')">
                <LucidePin />
            </button>
        </td>
        <!-- service -->
        <td class="is-size-4 is-narrow is-clickable" @click.exact="$emit('show-or-copy', account)" @keyup.enter="$emit('show-or-copy', account)" >
            <img v-if="props.account.icon && props.preferences.showAccountsIcons" role="presentation" class="tfa-icon" :src="storageRootPath + '/storage/icons/' + props.account.icon" alt="">
            <img v-else-if="props.account.icon == null && props.preferences.showAccountsIcons" role="presentation" class="tfa-icon" :src="storageRootPath + '/storage/noicon.svg'" alt="">
            {{ props.account.service ? props.account.service : $t('message.no_service') }}<LucideCircleAlert class="has-text-danger ml-2" v-if="props.account.account === $t('error.indecipherable')" />
            <span v-if="props.account.otp_type == 'hotp'" class="ml-2" :class="shareTagClass" :title="$t('tooltip.current_counter')">
                {{  props.account.counter }}
            </span>
        </td>
        <!-- account -->
        <td class="is-family-primary is-size-6 has-text-grey is-clickable" @click.exact="$emit('show-or-copy', account)" @keyup.enter="$emit('show-or-copy', account)" >
            <span v-if="props.account.is_shared" class="p-1 mr-1" :class="shareTagClass" :title="$t('tooltip.shared_with_me')">
                <LucideUserCheck class="icon-size-0-75" />
            </span>
            <span class="has-ellipsis">
                {{ props.account.account }}
            </span>
            <span v-for="tag in props.tags" :key="tag" class="tag p-1 ml-1" :class="shareTagClass">{{ tag }}</span>
            <span v-if="props.vaultBadge" class="tag p-1 ml-1" :class="shareTagClass">{{ props.vaultBadge }}</span>
        </td>
        <!-- reveal password button -->
        <template v-if="props.preferences.getOtpOnRequest == false && canReveal">
            <td class="is-narrow">
                <button v-if="props.revealed" type="button" class="button p-1 is-ghost has-text-grey-dark" @click.stop="$emit('toggle-reveal', props.account.id)">
                    <LucideEye />
                </button>
                <button v-else type="button" class="button p-1 is-ghost has-text-grey-dark" @click.stop="$emit('toggle-reveal', props.account.id)">
                    <LucideEyeOff />
                </button>
            </td>
        </template>
        <!-- always On TOTP or HOTP button -->
        <td v-if="props.preferences.getOtpOnRequest == false" class="is-narrow">
            <template v-if="props.account.otp != undefined">
                <div class="always-on-otp is-clickable has-nowrap is-size-5" @click="$emit('copy-to-clipboard', props.account.otp.password)" @keyup.enter="$emit('copy-to-clipboard', props.account.otp.password)" :title="$t('tooltip.copy_to_clipboard')">
                    {{ useVisiblePassword(
                            props.account.otp.password,
                            props.preferences.formatPassword,
                            props.preferences.formatPasswordBy,
                            props.preferences.showOtpAsDot,
                            props.preferences.revealDottedOTP && props.revealed
                        )
                    }}
                </div>
                <div v-if="props.account.otp_type.includes('totp')" class="has-nowrap" :style="{ 'lineHeight': '1rem' }">
                    <slot name="dots" />
                </div>
            </template>
            <div v-else :class="{'mt-5': props.preferences.displayMode == 'grid'}">
                <!-- get hotp button -->
                <button type="button" class="button tag" :class="buttonColor" @click="$emit('show-otp', account)" :title="$t('tooltip.import_this_account')">
                    {{ $t('label.generate') }}
                </button>
            </div>
        </td>
        <td v-else>
            <template v-if="props.account.otp_type.includes('totp')">
                <!-- get & copy totp button -->
                <button type="button" class="button is-small is-rounded" @click.stop="$emit('get-and-copy-otp', account)" :title="$t('tooltip.get_and_copy_in_a_click')">
                    {{ $t('label.get_and_copy') }}
                </button>
            </template>
        </td>
        <!-- next_otp -->
        <td v-if="props.preferences.getOtpOnRequest == false && props.preferences.showNextOtp" class="is-narrow has-text-grey is-size-7">
            <span v-if="props.account.otp != undefined" class="is-clickable has-nowrap" :class="nextOtpOpacityClass" @click="$emit('copy-to-clipboard', props.account.otp.next_password)" @keyup.enter="$emit('copy-to-clipboard', props.account.otp.next_password)" :title="$t('tooltip.copy_next_password')">
                {{ useVisiblePassword(
                        props.account.otp.next_password,
                        props.preferences.formatPassword,
                        props.preferences.formatPasswordBy,
                        props.preferences.showOtpAsDot,
                        props.preferences.revealDottedOTP && props.revealed
                    )
                }}
            </span>
        </td>
        <!-- Manage mode buttons -->
        <td class="is-narrow">
            <div class="tfa-cell tfa-edit" v-if="props.inManagementMode">
                <!-- edit button -->
                <router-link :to="{ name: 'editAccount', params: { twofaccountId: props.account.id }}" class="tag is-rounded mr-1" :class="buttonColor" :title="$t('tooltip.edit_account')">
                    <LucideSquarePen class="icon-size-1" />
                </router-link>
                <!-- show qrcode button -->
                <router-link :to="{ name: 'showQRcode', params: { twofaccountId: props.account.id }}" class="tag is-rounded mr-1" :class="buttonColor" :title="$t('tooltip.show_qrcode')">
                    <LucideQrCode class="icon-size-1" />
                </router-link>
                <!-- delete button -->
                <button @click="$emit('delete-account-clicked', props.account.id)" class="tag is-rounded" :class="buttonColor" :title="$t('tooltip.delete_account')">
                    <LucideTrash2 class="icon-size-1" />
                </button>
            </div>
        </td>
        <!-- drag handle -->
        <td class="is-narrow">
            <div class="drag-handle tfa-cell tfa-dots has-text-grey">
                <LucideMenu />
            </div>
        </td>
    </tr>
</template>
