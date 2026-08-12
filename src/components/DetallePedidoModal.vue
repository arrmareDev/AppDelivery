<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200"
            leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
            leave-to-class="opacity-0">
            <div v-if="show"
                class="fixed inset-0 z-[600] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
                @click.self="$emit('close')">
                <Transition enter-active-class="transition-all duration-250 ease-out"
                    enter-from-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
                    leave-to-class="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95">
                    <div v-if="show && despacho" class="w-full sm:max-w-md max-h-[92vh] bg-white rounded-t-3xl sm:rounded-3xl
                               shadow-2xl flex flex-col overflow-hidden">

                        <!-- Header -->
                        <div
                            class="px-5 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
                            <div class="min-w-0">
                                <span v-if="despacho.negocio"
                                    class="badge bg-purple-50 text-purple-700 border-purple-200 mb-2 inline-flex">
                                    {{ despacho.negocio }}
                                </span>
                                <p class="font-black text-lg leading-tight" style="color: var(--color-ink)">
                                    Pedido #{{ despacho.order_id }}
                                </p>
                            </div>
                            <button @click="$emit('close')"
                                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                   bg-gray-100 text-gray-500 border-none cursor-pointer hover:bg-gray-200 transition-colors">
                                <XMarkIcon class="w-5 h-5" />
                            </button>
                        </div>

                        <!-- Contenido scrolleable -->
                        <div class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

                            <!-- Cliente -->
                            <div>
                                <p class="text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Cliente</p>
                                <p class="font-black text-base" style="color: var(--color-ink)">{{
                                    despacho.order?.client_name }}</p>
                                <a v-if="despacho.order?.client_phone" :href="`tel:${despacho.order.client_phone}`"
                                    class="inline-flex items-center gap-1.5 mt-1 text-sm font-bold no-underline"
                                    style="color: var(--color-brand-600)">
                                    <PhoneIcon class="w-4 h-4" />
                                    {{ despacho.order.client_phone }}
                                </a>
                            </div>

                            <!-- Dirección -->
                            <div>
                                <p class="text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Dirección de entrega</p>
                                <p class="text-sm font-medium flex items-start gap-1.5" style="color: var(--color-ink)">
                                    <MapPinIcon class="w-4 h-4 shrink-0 mt-0.5" style="color: var(--color-ink-faint)" />
                                    {{ direccion }}
                                </p>
                                <p v-if="despacho.order?.reference"
                                    class="text-[13px] text-amber-700 font-medium mt-1 ml-[22px]">
                                    Referencia: {{ despacho.order.reference }}
                                </p>
                                <a v-if="despacho.order?.lat && despacho.order?.lng" :href="mapsUrl" target="_blank"
                                    rel="noopener"
                                    class="inline-flex items-center gap-1.5 mt-2 ml-[22px] text-[13px] font-bold no-underline"
                                    style="color: var(--color-brand-600)">
                                    <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                                    Abrir en Maps
                                </a>
                            </div>

                            <!-- Items completos -->
                            <div>
                                <p class="text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Pedido</p>
                                <div class="flex flex-col gap-1.5">
                                    <div v-for="(item, i) in despacho.order?.items ?? []" :key="i"
                                        class="flex items-center justify-between text-sm">
                                        <span style="color: var(--color-ink)">{{ item.qty }}x {{ item.name }}</span>
                                        <span v-if="item.subtotal" class="font-semibold text-gray-500">
                                            S/ {{ Number(item.subtotal).toFixed(2) }}
                                        </span>
                                    </div>
                                </div>
                                <p v-if="despacho.order?.note"
                                    class="text-[13px] text-amber-700 mt-2 px-2.5 py-2 rounded-xl bg-amber-50">
                                    "{{ despacho.order.note }}"
                                </p>
                            </div>

                            <!-- Pago -->
                            <div v-if="esContraentrega"
                                class="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2">
                                <component
                                    :is="despacho.order?.metodo_pago === 'contraentrega_yape' ? DevicePhoneMobileIcon : BanknotesIcon"
                                    class="w-4 h-4 text-amber-700 shrink-0" />
                                <span class="text-[13px] font-bold text-amber-700">
                                    {{ despacho.order?.metodo_pago === 'contraentrega_yape'
                                        ? `Cobrar S/ ${totalPedido} por Yape/Plin`
                                        : `Cobrar S/ ${totalPedido} en efectivo` }}
                                </span>
                            </div>

                            <!-- Resumen de montos -->
                            <div class="flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                                <div class="flex items-center justify-between text-sm">
                                    <span class="text-gray-500">Total del pedido</span>
                                    <span class="font-bold" style="color: var(--color-ink)">S/ {{ totalPedido }}</span>
                                </div>
                                <div class="flex items-center justify-between">
                                    <span class="text-sm text-gray-500">Ganas por esta entrega</span>
                                    <span class="font-black text-lg" style="color: var(--color-brand-600)">
                                        S/ {{ Number(despacho.comision_motorizado ?? 0).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Footer con acción -->
                        <div class="px-5 py-4 border-t border-gray-100 shrink-0 flex flex-col gap-2">
                            <p v-if="deshabilitado"
                                class="text-[12.5px] text-blue-700 bg-blue-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
                                <InformationCircleIcon class="w-4 h-4 shrink-0" />
                                Ya tienes el máximo de pedidos activos.
                            </p>
                            <button @click="$emit('aceptar')" :disabled="aceptando || deshabilitado" class="w-full py-3.5 rounded-2xl text-white font-black text-sm uppercase tracking-wide
                                       border-none cursor-pointer active:scale-[0.99] disabled:opacity-60
                                       disabled:cursor-not-allowed transition-all duration-150
                                       flex items-center justify-center gap-2"
                                style="background: var(--color-brand-600)">
                                <span v-if="aceptando" class="spinner" />
                                <BoltIcon v-else class="w-4 h-4" />
                                {{ aceptando ? 'Aceptando...' : 'Aceptar pedido' }}
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    XMarkIcon, PhoneIcon, MapPinIcon, ArrowTopRightOnSquareIcon,
    DevicePhoneMobileIcon, BanknotesIcon, InformationCircleIcon,
} from '@heroicons/vue/24/outline'
import { BoltIcon } from '@heroicons/vue/24/solid'
import type { DespachoItem } from '../stores/despacho'

const props = defineProps<{
    show: boolean
    despacho: DespachoItem | null
    aceptando: boolean
    deshabilitado?: boolean
}>()

defineEmits<{ close: []; aceptar: [] }>()

const direccion = computed(() => {
    const o = props.despacho?.order
    if (!o) return ''
    return [o.address, o.district].filter(Boolean).join(', ')
})

const totalPedido = computed(() =>
    Number(props.despacho?.order?.total ?? 0).toFixed(2)
)

const esContraentrega = computed(() =>
    ['contraentrega_efectivo', 'contraentrega_yape']
        .includes(props.despacho?.order?.metodo_pago ?? '')
)

const mapsUrl = computed(() => {
    const o = props.despacho?.order
    if (!o?.lat || !o?.lng) return ''
    return `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`
})
</script>

<style scoped>
.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>