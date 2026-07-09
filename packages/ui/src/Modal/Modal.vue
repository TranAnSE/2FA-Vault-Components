<script setup>
    import { NavigationButton } from '@2fauth/formcontrols'
    import { useNotify } from '../Notify'
    import { VueFooterContent } from '../VueFooterContent'

    // Visibility is driven by the DEFAULT model so callers can use the
    // idiomatic `<Modal v-model="showX">` syntax. Every existing consumer
    // (webapp + extension + this package's own story) binds the default
    // model, so defineModel() with no name is the correct contract.
    const isActive = defineModel()
    const showFooterMenu = defineModel('showFooterMenu')
    const props = defineProps({
        isFullHeight:  {
            type: Boolean,
            default: false
        }
    })

    function closeModal(event) {
        useNotify().clear()
        isActive.value = false
    }
</script>

<template>
    <div class="modal modal-otp" v-bind:class="{ 'is-active': isActive }">
        <div class="modal-background" @click.stop="closeModal"></div>
        <div class="modal-card is-flex-grow-1">
            <section class="modal-card-body modal-slot py-0 is-align-content-center has-text-centered">
                <slot name="default" />
            </section>
            <div @click="showFooterMenu = false" v-if="showFooterMenu == true" class="footer-overlay"></div>
            <footer class="modal-card-foot is-flex-direction-column main toto">
                <VueFooterContent v-model:show-menu="showFooterMenu">
                    <template #default>
                        <NavigationButton action="close" :useLinkTag="false" @closed="closeModal" />
                    </template>
                    <template #submenu>
                        <slot name="footer-submenu" />
                    </template>
                    <template #subpart>
                        <slot name="footer-subpart">
                            <router-link v-if="$route.name != 'accounts'" id="lnkBackToHome" :to="{ name: 'accounts' }" class="has-text-grey">{{ $t('link.back_to_home') }}</router-link>
                            <span v-else>&nbsp;</span>
                        </slot>
                    </template>
                </VueFooterContent>
            </footer>
        </div>
    </div>
</template>