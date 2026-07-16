<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200"
            leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
            leave-to-class="opacity-0">
            <div v-if="modelValue" class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm
                       flex items-center justify-center p-4" @click.self="$emit('update:modelValue', false)">

                <div class="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center
                            transition-all duration-200 ease-out"
                    :class="modelValue ? 'opacity-100 scale-100' : 'opacity-0 scale-95'">

                    <div class="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                        :class="variantClasses.iconBg">
                        <component :is="icon" class="w-7 h-7" :class="variantClasses.iconColor" />
                    </div>

                    <h3 class="font-black text-[18px] sm:text-[19px] m-0 mb-2" style="color: var(--color-ink)">
                        {{ title }}
                    </h3>
                    <p class="text-[13.5px] m-0 mb-6 leading-relaxed" style="color: var(--color-ink-soft)">
                        {{ message }}
                    </p>

                    <div class="flex gap-3">
                        <button @click="$emit('update:modelValue', false)" :disabled="loading"
                            class="btn-outline flex-1">
                            {{ cancelLabel }}
                        </button>
                        <button @click="$emit('confirm')" :disabled="loading"
                            class="btn flex-1 py-3 text-[13.5px] text-white" :class="variantClasses.confirmBtn">
                            <span v-if="loading" class="spinner" />
                            {{ loading ? loadingLabel : confirmLabel }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    ExclamationTriangleIcon,
    ExclamationCircleIcon,
    CheckCircleIcon,
    InformationCircleIcon,
} from '@heroicons/vue/24/solid'

const props = defineProps<{
    modelValue: boolean
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'success' | 'info'
    confirmLabel?: string
    cancelLabel?: string
    loadingLabel?: string
    loading?: boolean
}>()

defineEmits<{
    'update:modelValue': [value: boolean]
    confirm: []
}>()

const confirmLabel = computed(() => props.confirmLabel ?? 'Confirmar')
const cancelLabel = computed(() => props.cancelLabel ?? 'Cancelar')
const loadingLabel = computed(() => props.loadingLabel ?? 'Procesando...')

const icon = computed(() => {
    const map = {
        danger: ExclamationTriangleIcon,
        warning: ExclamationCircleIcon,
        success: CheckCircleIcon,
        info: InformationCircleIcon,
    }
    return map[props.variant ?? 'warning']
})

const variantClasses = computed(() => {
    const map = {
        danger: { iconBg: 'bg-red-50', iconColor: 'text-red-600', confirmBtn: 'bg-red-600 hover:bg-red-700' },
        warning: { iconBg: 'bg-amber-50', iconColor: 'text-amber-500', confirmBtn: 'bg-amber-500 hover:bg-amber-600' },
        success: { iconBg: 'bg-green-50', iconColor: 'text-green-600', confirmBtn: 'bg-green-600 hover:bg-green-700' },
        info: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', confirmBtn: 'bg-blue-600 hover:bg-blue-700' },
    }
    return map[props.variant ?? 'warning']
})
</script>