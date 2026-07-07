<script setup>
    import { FormFieldError } from '../FormFieldError'
    import { useIdGenerator, useValidationErrorIdGenerator } from '../helpers'
    import { LucideChevronRight, LucideLock } from '@lucide/vue'

    defineOptions({
        inheritAttrs: false
    })

    const props = defineProps({
        modelValue: [String, Number, Boolean],
        label: {
            type: String,
            default: ''
        },
        fieldName: {
            type: String,
            default: '',
            required: true
        },
        inputType: {
            type: String,
            default: 'text'
        },
        errorMessage: [String],
        placeholder: {
            type: String,
            default: ''
        },
        help: {
            type: String,
            default: ''
        },
        fontSize: {
            type: String,
            default: 'is-small'
        },
        hasOffset: {
            type: Boolean,
            default: false
        },
        isDisabled: {
            type: Boolean,
            default: false
        },
        maxLength: {
            type: Number,
            default: null
        },
        isIndented: Boolean,
        isLocked: Boolean,
        leftIcon: {
            type: String,
            default: ''
        },
        rightIcon: {
            type: String,
            default: ''
        },
        idSuffix: {
            type: String,
            default: ''
        }
    })

    const { inputId } = useIdGenerator(props.inputType, props.fieldName + props.idSuffix)
    const { valErrorId } = useValidationErrorIdGenerator(props.fieldName)
    const legendId = useIdGenerator('legend', props.fieldName).inputId
</script>

<template>
    <div class="mb-3" :class="{ 'pt-3' : hasOffset, 'is-flex' : isIndented }">
        <div v-if="isIndented" class="mx-2 pr-1" :class="{ 'is-opacity-5' : isDisabled || isLocked }">
            <LucideChevronRight class="has-text-grey rotate-135" />
        </div>
        <div class="field" :class="{ 'is-flex-grow-5' : isIndented }">
            <label v-if="label" :for="inputId" class="label">
                {{ $t(props.label) }}<LucideLock v-if="isLocked" class="ml-2 icon-size-1" />
            </label>
            <div class="control" :class="{ 'has-icons-left' : leftIcon, 'has-icons-right': rightIcon }">
                <textarea 
                    :disabled="isDisabled || isLocked" 
                    :name="fieldName"
                    :id="inputId"
                    class="textarea has-fixed-size" 
                    :class="fontSize"
                    :value="modelValue" 
                    :placeholder="placeholder" 
                    v-bind="$attrs"
                    v-on:input="$emit('update:modelValue', $event.target.value)"
                    v-on:change="$emit('change:modelValue', $event.target.value)"
                    :maxlength="maxLength"
                    :aria-describedby="help ? legendId : undefined"
                    :aria-invalid="errorMessage != undefined"
                    :aria-errormessage="errorMessage != undefined ? valErrorId : undefined" 
                />
            </div>
            <FormFieldError v-if="errorMessage != undefined" :error="errorMessage" :field="fieldName" />
            <p :id="legendId" class="help" v-if="help">{{ $t(help) }}</p>
        </div>
    </div> 
</template>
