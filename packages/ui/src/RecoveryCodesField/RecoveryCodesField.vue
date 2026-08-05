<script setup>
    /**
     * RecoveryCodesField
     *
     * A first-class editor/viewer for the free-text `recovery_codes` field
     * stored (encrypted) on a TwoFAccount. The backend keeps the value as
     * opaque user-entered text, so this component preserves that contract: it
     * parses the text into individual codes purely for display, and emits the
     * raw text back via v-model.
     *
     * UX over a plain textarea:
     *   - Codes are masked (●●● ●●●●) by default to defeat shoulder-surfing.
     *   - A reveal toggle shows/hides every code at once.
     *   - Copy-all and copy-per-code via the clipboard.
     *   - A paste/import field accepts bulk text (one code per line) and
     *     normalises it back into the stored value.
     */
    import { ref, computed, watch } from 'vue'
    import { useClipboard } from '@vueuse/core'
    import { LucideEye, LucideEyeOff, LucideCopy, LucideCheck, LucideTrash2 } from '@lucide/vue'

    import i18n from '../i18n'

    const { t } = i18n.global
    const { copy, copied, isSupported: clipboardSupported } = useClipboard({ legacy: true })

    /** v-model bound to the raw recovery_codes text. */
    const model = defineModel({ type: String, default: '' })

    const props = defineProps({
        /** Whether the field is editable (false in read-only views). */
        editable: {
            type: Boolean,
            default: true,
        },
        /** Max length mirrored to the backend field constraint. */
        maxlength: {
            type: Number,
            default: 10000,
        },
    })

    const emit = defineEmits(['copied'])

    /** Whether codes are currently revealed (unmasked). */
    const revealed = ref(false)

    /** Bulk-paste input (separate textarea so the main list stays tidy). */
    const pasteBuffer = ref('')

    /** Per-code "just copied" feedback (index -> boolean). */
    const copiedIndex = ref(null)

    /**
     * Split the raw text into individual codes. Codes are commonly one per
     * line, but users paste them space- or comma-separated too; we normalise
     * any run of whitespace/commas to a split boundary and drop empties.
     */
    const codes = computed(() => {
        const raw = String(model.value ?? '')
        if (!raw.trim()) return []
        return raw
            .split(/[\s,]+/)
            .map(c => c.trim())
            .filter(c => c.length > 0)
    })

    /** Mask a single code for display (e.g. "abcd-1234" -> "●●●● ●●●●"). */
    function mask(code) {
        return String(code).replace(/[^\s-]/g, '●')
    }

    watch(model, () => {
        // Reset per-code copied feedback when the underlying value changes.
        copiedIndex.value = null
    })

    function toggleReveal() {
        revealed.value = !revealed.value
    }

    function copyAll() {
        if (!codes.value.length) return
        copy(codes.value.join('\n'))
        emit('copied', 'all')
    }

    function copyOne(code, index) {
        copy(code)
        copiedIndex.value = index
        emit('copied', index)
    }

    /** Normalise the bulk-paste buffer into the stored value (one code/line). */
    function importPasted() {
        const normalised = String(pasteBuffer.value ?? '')
            .split(/[\s,]+/)
            .map(c => c.trim())
            .filter(c => c.length > 0)
            .join('\n')

        const merged = model.value && model.value.trim()
            ? String(model.value).trim() + '\n' + normalised
            : normalised

        // Respect the backend maxlength to avoid silent truncation surprises.
        model.value = merged.length > props.maxlength
            ? merged.slice(0, props.maxlength)
            : merged
        pasteBuffer.value = ''
    }

    function clearAll() {
        model.value = ''
        pasteBuffer.value = ''
    }
</script>

<template>
    <div class="recovery-codes-field">
        <!-- Header row: label + actions -->
        <div class="is-flex is-align-items-center is-justify-content-space-between mb-2">
            <label class="label mb-0">{{ t('field.recovery_codes') }}</label>
            <div class="is-flex is-align-items-center gap-1">
                <button
                    type="button"
                    class="button is-small is-ghost"
                    :title="revealed ? t('label.hide_codes') : t('label.show_codes')"
                    :aria-label="revealed ? t('label.hide_codes') : t('label.show_codes')"
                    :aria-pressed="revealed"
                    @click.prevent="toggleReveal"
                >
                    <component :is="revealed ? LucideEyeOff : LucideEye" :size="16" />
                </button>
                <button
                    type="button"
                    class="button is-small is-ghost"
                    :title="t('label.copy_all')"
                    :aria-label="t('label.copy_all')"
                    :disabled="!codes.length"
                    @click.prevent="copyAll"
                >
                    <component :is="copied ? LucideCheck : LucideCopy" :size="16" />
                </button>
                <button
                    v-if="editable"
                    type="button"
                    class="button is-small is-ghost"
                    :title="t('label.clear_codes')"
                    :aria-label="t('label.clear_codes')"
                    :disabled="!codes.length"
                    @click.prevent="clearAll"
                >
                    <LucideTrash2 :size="16" />
                </button>
            </div>
        </div>

        <!-- Codes list (masked by default) -->
        <div v-if="codes.length" class="codes-list tags are-medium mb-2" role="list">
            <span
                v-for="(code, index) in codes"
                :key="index"
                class="tag is-family-monospace is-clickable"
                role="listitem"
                :title="t('label.copy_one')"
                @click.prevent="copyOne(code, index)"
            >
                <component
                    :is="copiedIndex === index ? LucideCheck : LucideCopy"
                    v-if="clipboardSupported"
                    :size="12"
                    class="mr-1"
                />
                {{ revealed ? code : mask(code) }}
            </span>
        </div>

        <p v-else class="help mb-2">{{ t('field.recovery_codes.empty') }}</p>

        <!-- Bulk paste / import (edit mode only) -->
        <div v-if="editable" class="field">
            <div class="control">
                <textarea
                    v-model="pasteBuffer"
                    class="textarea is-small"
                    :placeholder="t('field.recovery_codes.paste_placeholder')"
                    rows="2"
                ></textarea>
            </div>
            <div class="control">
                <button
                    type="button"
                    class="button is-small is-rounded"
                    :disabled="!pasteBuffer.trim()"
                    @click.prevent="importPasted"
                >
                    {{ t('label.import_codes') }}
                </button>
            </div>
        </div>

        <p class="help">{{ t('field.recovery_codes.help') }}</p>
    </div>
</template>

<style scoped>
    .recovery-codes-field .gap-1 {
        gap: 0.25rem;
    }
    .recovery-codes-field .codes-list {
        max-height: 12rem;
        overflow-y: auto;
    }
    .recovery-codes-field .codes-list .tag {
        background-color: var(--bulma-scheme-main-ter);
    }
</style>
