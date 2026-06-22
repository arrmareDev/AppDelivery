<template>
    <div class="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden
                transition-all duration-200"
        :class="aceptando ? 'border-red-300 shadow-red-100' : 'hover:border-red-200'">

        <div class="p-4">

            <!-- Header: ID + Total -->
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-black px-2 py-0.5 rounded-lg
                             bg-gray-100 text-gray-600 font-mono">
                    #{{ despacho.order_id }}
                </span>
                <div class="flex items-baseline gap-0.5">
                    <span class="text-xs font-semibold text-gray-400">S/</span>
                    <span class="font-black text-xl text-red-600 leading-none">
                        {{ Number(despacho.order?.total ?? 0).toFixed(2) }}
                    </span>
                </div>
            </div>

            <!-- Badge restaurante -->
            <span v-if="despacho.restaurant" class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full
                       bg-purple-50 text-purple-700 border border-purple-200 mb-1.5">
                {{ despacho.restaurant }}
            </span>

            <!-- Nombre cliente -->
            <p class="font-black text-gray-900 text-base leading-tight">
                {{ despacho.order?.client_name }}
            </p>

            <!-- Dirección — sin coma suelta cuando district es null -->
            <p class="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {{ direccion }}
            </p>

            <!-- Referencia si existe -->
            <p v-if="despacho.order?.reference" class="text-xs text-amber-700 font-medium mt-1 flex items-center gap-1">
                📍 {{ despacho.order.reference }}
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
                <span class="text-sm">
                    {{ despacho.order?.metodo_pago === 'contraentrega_yape' ? '📱' : '💵' }}
                </span>
                <span class="text-[11px] font-bold text-amber-700">
                    {{ despacho.order?.metodo_pago === 'contraentrega_yape'
                        ? 'Cobrar por Yape/Plin'
                        : 'Cobrar en efectivo' }}
                </span>
            </div>

            <!-- Tiempo -->
            <p class="text-xs text-gray-400 mt-2">
                Solicitado {{ tiempoTranscurrido }}
            </p>
        </div>

        <!-- Botón aceptar -->
        <button @click.stop="$emit('aceptar')" :disabled="aceptando" class="w-full py-3.5 bg-red-600 text-white font-black text-sm
                   uppercase tracking-wide border-none cursor-pointer
                   hover:bg-red-700 active:bg-red-800
                   disabled:opacity-60 disabled:cursor-not-allowed
                   transition-all duration-150
                   flex items-center justify-center gap-2">
            <span v-if="aceptando" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ aceptando ? 'Aceptando...' : '⚡ Aceptar pedido' }}
        </button>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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