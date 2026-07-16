<template>
    <div class="card overflow-hidden transition-all duration-200"
        :class="aceptando ? 'ring-2' : 'hover:border-[color:var(--color-brand-200)]'"
        :style="aceptando ? 'border-color: var(--color-brand-300); box-shadow: 0 0 0 2px rgba(225,68,42,0.12)' : ''">

        <div class="p-4">

            <!-- Header: ID + Total -->
            <div class="flex items-center justify-between mb-2">
                <span class="order-code text-xs px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600">
                    #{{ despacho.order_id }}
                </span>
                <div class="flex items-baseline gap-0.5">
                    <span class="text-xs font-semibold text-gray-400">S/</span>
                    <span class="amount text-xl leading-none" style="color: var(--color-brand-600)">
                        {{ Number(despacho.order?.total ?? 0).toFixed(2) }}
                    </span>
                </div>
            </div>

            <!-- Badge restaurante -->
            <span v-if="despacho.restaurant" class="badge bg-purple-50 text-purple-700 border-purple-200 mb-1.5">
                {{ despacho.restaurant }}
            </span>

            <!-- Nombre cliente -->
            <p class="font-black text-base leading-tight" style="color: var(--color-ink)">
                {{ despacho.order?.client_name }}
            </p>

            <!-- Dirección — sin coma suelta cuando district es null -->
            <p class="text-sm mt-0.5 flex items-center gap-1" style="color: var(--color-ink-soft)">
                <MapPinIcon class="w-3.5 h-3.5 shrink-0" />
                {{ direccion }}
            </p>

            <!-- Referencia si existe -->
            <p v-if="despacho.order?.reference" class="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                <MapPinIcon class="w-3.5 h-3.5 shrink-0" />
                {{ despacho.order.reference }}
            </p>

            <!-- Items -->
            <div class="mt-3 flex flex-wrap gap-1.5">
                <span v-for="item in despacho.order?.items?.slice(0, 3)" :key="item.name"
                    class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                    {{ item.qty }}x {{ item.name }}
                </span>
                <span v-if="(despacho.order?.items?.length ?? 0) > 3"
                    class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
                    +{{ (despacho.order?.items?.length ?? 0) - 3 }} más
                </span>
            </div>

            <!-- Método de pago si es contraentrega -->
            <div v-if="esContraentrega" class="mt-2 px-2 py-1 rounded-lg bg-amber-50 border border-amber-200
                       flex items-center gap-1.5 self-start inline-flex">
                <component
                    :is="despacho.order?.metodo_pago === 'contraentrega_yape' ? DevicePhoneMobileIcon : BanknotesIcon"
                    class="w-3.5 h-3.5 text-amber-700" />
                <span class="text-[11px] font-bold text-amber-700">
                    {{ despacho.order?.metodo_pago === 'contraentrega_yape'
                        ? 'Cobrar por Yape/Plin'
                        : 'Cobrar en efectivo' }}
                </span>
            </div>

            <!-- Tiempo -->
            <p class="text-xs mt-2" style="color: var(--color-ink-faint)">
                Solicitado {{ tiempoTranscurrido }}
            </p>
        </div>

        <!-- Botón aceptar -->
        <button @click.stop="$emit('aceptar')" :disabled="aceptando" class="btn-accept w-full py-3.5 text-white font-black text-sm
                   uppercase tracking-wide border-none cursor-pointer
                   active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-150
                   flex items-center justify-center gap-2">
            <span v-if="aceptando" class="spinner" />
            <BoltIcon v-else class="w-4 h-4" />
            {{ aceptando ? 'Aceptando...' : 'Aceptar pedido' }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPinIcon, DevicePhoneMobileIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { BoltIcon } from '@heroicons/vue/24/solid'
import type { DespachoItem } from '../stores/despacho'

const props = defineProps<{
    despacho: DespachoItem
    aceptando: boolean
}>()

defineEmits<{ aceptar: [] }>()

// Dirección sin coma suelta cuando district es null
const direccion = computed(() => {
    const o = props.despacho.order
    if (!o) return ''
    return [o.address, o.district].filter(Boolean).join(', ')
})

// Detectar si es contraentrega para mostrar aviso en la card
const esContraentrega = computed(() =>
    ['contraentrega_efectivo', 'contraentrega_yape']
        .includes(props.despacho.order?.metodo_pago ?? '')
)

const tiempoTranscurrido = computed(() => {
    if (!props.despacho.solicitado_at) return ''
    const diff = Date.now() - new Date(props.despacho.solicitado_at).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return 'hace un momento'
    if (mins === 1) return 'hace 1 min'
    return `hace ${mins} mins`
})
</script>

<style scoped>
.btn-accept {
    background: var(--color-brand-600);
}

.btn-accept:hover:not(:disabled) {
    background: var(--color-brand-700);
}
</style>