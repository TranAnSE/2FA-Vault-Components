<script setup>
    const props = defineProps({
        useDesktopTableLayout: {
            type: Boolean,
            default: false,
        },
        isCentered: {
            type: Boolean,
            default: false,
        },
    })

</script>

<template>
    <table v-if="props.useDesktopTableLayout" class="table tfa-table is-fullwidth">
        <tbody id="dv">
            <slot />
        </tbody>
    </table>
    <span v-else id="dv" class="columns is-multiline m-0" :class="{ 'is-centered': isCentered === true }">
        <slot />
    </span>
</template>
