<script setup>
    import { LucideAtSign, LucideSquareSlash, LucideStar, LucideUserCheck, LucideUsers } from '@lucide/vue'
    import { UseColorMode } from '@vueuse/components'

    const activeGroup = defineModel('activeGroup')
    const showGroupSwitch = defineModel('showGroupSwitch')
    const showFavoritesOnly = defineModel('showFavoritesOnly')

    const props = defineProps({
        groups: Array,
        filteredCount: {
            type: Number,
            default: null
        },
        useVirtualChips: {
            type: Boolean,
            default: false
        },
        useShare: {
            type: Boolean,
            default: false
        },
        useShareAllScope: {
            type: Boolean,
            default: false
        },
        useFavorites: {
            type: Boolean,
            default: false
        },
        isRightAligned: {
            type: Boolean,
            default: false
        },
    })

    const emit = defineEmits([
        'active-group-changed'
    ])

    /**
     * Sets the selected group
     */
    function setActiveGroup(id) {
        activeGroup.value = id
        emit('active-group-changed', id)
    }

</script>

<template>
    <div id="groupChips" class="mx-3 tags" :class="props.isRightAligned ? 'is-justify-content-right' : 'is-justify-content-center'">
    <UseColorMode v-slot="{ mode }">
        <button class="button tag" :class="{'is-white': mode != 'dark', 'has-text-grey' : activeGroup != 0 }" @click="setActiveGroup(-0)" :title="$t('label.all_accounts')">
            {{ $t('label.all') }}{{ activeGroup == 0 ? ` • ${filteredCount}` : '' }}
        </button>
        <template v-if="props.useFavorites">
            <button class="button tag" :class="{ 'has-text-grey' : mode == 'dark', 'is-white has-text-grey' : mode != 'dark' }" @click="showFavoritesOnly = !showFavoritesOnly" :title="$t('tooltip.show_favorites_only')">
                <LucideStar v-if="showFavoritesOnly" class="icon-size-0-9" :class="mode == 'dark' ? 'has-text-warning-dark-invert' : 'has-text-grey'" fill="#ffb400" />
                <LucideStar v-else class="icon-size-0-9" />
            </button>
        </template>
        <template v-for="group in groups" :key="group.id" >
            <button
                v-if="(group.id != 0 && group.show_in_chips) || (activeGroup > 0 && group.id == activeGroup && group.show_in_chips != true)"
                class="button tag" :class="{'has-text-grey' : mode == 'dark'&& activeGroup != group.id, 'is-white has-text-grey' : mode != 'dark'&& activeGroup != group.id, 'is-link' : activeGroup == group.id}"
                @click="setActiveGroup(group.id)">
                <span class="chip-label mr-1">{{ group.name }}</span>{{ activeGroup == group.id ? `• ${filteredCount}` : '' }}
            </button>
        </template>
        <button class="button tag has-text-grey" :class="mode == 'dark' ? '' : 'is-white'" @click="showGroupSwitch = true">
            ...
        </button>
        <template v-if="useVirtualChips">
            <button v-if="useShare" class="button tag" :class="{'has-text-grey' : mode == 'dark' && activeGroup != -2, 'is-white has-text-grey' : mode != 'dark'&& activeGroup != -2, 'is-link' : activeGroup == -2}" @click="setActiveGroup(-2)" :title="$t('label.accounts_I_m_sharing')">
                <template v-if="useShareAllScope">
                    <LucideUsers class="icon-size-0-9 mr-1" />|
                </template>
                <LucideUserCheck class="ml-1 icon-size-0-9" :class="{ 'mr-1': activeGroup == -2 }" />{{ activeGroup == -2 ? `• ${filteredCount}` : '' }}
            </button>
            <button v-if="useShare" class="button tag" :class="{'has-text-grey' : mode == 'dark' && activeGroup != -3, 'is-white has-text-grey' : mode != 'dark'&& activeGroup != -3, 'is-link' : activeGroup == -3}" @click="setActiveGroup(-3)" :title="$t('label.accounts_shared_with_me')">
                <LucideAtSign class="icon-size-0-9" :class="{ 'mr-1': activeGroup == -3 }" />{{ activeGroup == -3 ? `• ${filteredCount}` : '' }}
            </button>
            <button class="button tag" :class="{'has-text-grey' : mode == 'dark' && activeGroup != -1, 'is-white has-text-grey' : mode != 'dark' && activeGroup != -1, 'is-link' : activeGroup == -1}" @click="setActiveGroup(-1)" :title="$t('label.group_less_accounts')">
                <LucideSquareSlash class="icon-size-1" :class="{ 'mr-1': activeGroup == -1 }" />{{ activeGroup == -1 ? `• ${filteredCount}` : '' }}
            </button>
        </template>
    </UseColorMode>
    </div>
</template>