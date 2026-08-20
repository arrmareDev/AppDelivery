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
                                <p v-if="despacho.negocio_direccion"
                                    class="text-[12px] text-gray-400 mt-1 m-0 flex items-start gap-1">
                                    <BuildingStorefrontIcon class="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {{ despacho.negocio_direccion }}
                                </p>
                                <a v-if="tieneCoordenadasNegocio" :href="mapsUrlNegocio" target="_blank" rel="noopener"
                                    class="inline-flex items-center gap-1 mt-1 text-[11.5px] font-bold no-underline"
                                    style="color: var(--color-brand-600)">
                                    <ArrowTopRightOnSquareIcon class="w-3 h-3" />
                                    Abrir en Maps para ir a la tienda
                                </a>
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

                                <!-- Mapa embebido con el punto marcado -->
                                <div v-if="tieneCoordenadas" id="detalle-map"
                                    class="mt-2.5 w-full h-40 rounded-2xl overflow-hidden border border-gray-100" />

                                <a v-if="tieneCoordenadas" :href="mapsUrl" target="_blank" rel="noopener"
                                    class="inline-flex items-center gap-1.5 mt-2 text-[13px] font-bold no-underline"
                                    style="color: var(--color-brand-600)">
                                    <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                                    Abrir en Maps para navegar
                                </a>
                            </div>

                            <!-- Items completos -->
                            <div>
                                <p class="text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                                    Pedido</p>
                                <div class="flex flex-col gap-2">
                                    <div v-for="(item, i) in despacho.order?.items ?? []" :key="i">
                                        <p class="text-sm m-0" style="color: var(--color-ink)">
                                            {{ item.qty }}x {{ item.name }}
                                        </p>
                                        <p v-if="item.custom_summary" class="text-[12px] text-gray-500 m-0 mt-0.5">
                                            {{ item.custom_summary }}
                                        </p>
                                    </div>
                                </div>
                                <p v-if="despacho.order?.note"
                                    class="text-[13px] text-amber-700 mt-2 px-2.5 py-2 rounded-xl bg-amber-50">
                                    "{{ despacho.order.note }}"
                                </p>
                            </div>

                            <!-- Estado del pago — siempre visible, no solo contraentrega -->
                            <div class="px-3 py-2.5 rounded-xl flex items-center gap-2"
                                :class="requiereCobro ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'">
                                <component :is="requiereCobro
                                    ? (despacho.order?.metodo_pago === 'contraentrega_yape' ? DevicePhoneMobileIcon : BanknotesIcon)
                                    : CheckCircleIcon" class="w-4 h-4 shrink-0"
                                    :class="requiereCobro ? 'text-amber-700' : 'text-green-700'" />
                                <span class="text-[13px] font-bold"
                                    :class="requiereCobro ? 'text-amber-700' : 'text-green-700'">
                                    {{ requiereCobro
                                        ? `Cobrar S/ ${totalPedido} — ${metodoPagoLabel}`
                                        : `Ya pagado — ${metodoPagoLabel}` }}
                                </span>
                            </div>

                            <!-- Costo de delivery — el motorizado no ve el precio del pedido -->
                            <div v-if="despacho.order?.delivery_fee != null"
                                class="flex items-center justify-between pt-3 border-t border-gray-100">
                                <span class="text-sm text-gray-500">Costo de delivery</span>
                                <span class="font-black text-lg" style="color: var(--color-ink)">
                                    S/ {{ Number(despacho.order.delivery_fee).toFixed(2) }}
                                </span>
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
import { computed, nextTick, watch } from 'vue'
import {
    XMarkIcon, PhoneIcon, MapPinIcon, ArrowTopRightOnSquareIcon,
    DevicePhoneMobileIcon, BanknotesIcon, InformationCircleIcon, CheckCircleIcon,
    BuildingStorefrontIcon,
} from '@heroicons/vue/24/outline'
import { BoltIcon } from '@heroicons/vue/24/solid'
import type { DespachoItem } from '../stores/despacho'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

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

const tieneCoordenadas = computed(() =>
    !!(props.despacho?.order?.lat && props.despacho?.order?.lng)
)

const tieneCoordenadasNegocio = computed(() =>
    !!(props.despacho?.negocio_lat && props.despacho?.negocio_lng)
)

const mapsUrlNegocio = computed(() => {
    const d = props.despacho
    if (!d?.negocio_lat || !d?.negocio_lng) return ''
    return `https://www.google.com/maps/dir/?api=1&destination=${d.negocio_lat},${d.negocio_lng}`
})

// El backend manda "pagado" cuando el negocio lo especifica. Si no viene
// (negocios más viejos que todavía no lo mandan), caemos de respaldo a
// adivinar por el método de pago — contraentrega siempre implica cobro.
const requiereCobro = computed(() => {
    const o = props.despacho?.order
    if (!o) return false
    if (o.pagado === true) return false
    if (o.pagado === false) return true
    return ['contraentrega_efectivo', 'contraentrega_yape'].includes(o.metodo_pago ?? '')
})

const metodoPagoLabel = computed(() => {
    const m = props.despacho?.order?.metodo_pago ?? ''
    const labels: Record<string, string> = {
        tarjeta: 'Tarjeta',
        yape: 'Yape',
        plin: 'Plin',
        transferencia: 'Transferencia',
        efectivo: 'Efectivo',
        contraentrega_efectivo: 'Efectivo',
        contraentrega_yape: 'Yape/Plin',
    }
    return labels[m] ?? (m || 'No especificado')
})

const mapsUrl = computed(() => {
    const o = props.despacho?.order
    if (!o?.lat || !o?.lng) return ''
    return `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`
})

// ── Mapa embebido — mismo patrón que DespachoView.vue ──────
let mapa: L.Map | null = null

function initMapa() {
    const o = props.despacho?.order
    if (!o?.lat || !o?.lng) return

    const el = document.getElementById('detalle-map')
    if (!el) return

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
    })

    if (mapa) { mapa.remove(); mapa = null }

    mapa = L.map('detalle-map', {
        center: [o.lat, o.lng],
        zoom: 16,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
    }).addTo(mapa)

    const redIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:26px;height:26px;background:#dc2626;border:3px solid white;
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(220,38,38,0.5);
        "></div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 26],
    })

    L.marker([o.lat, o.lng], { icon: redIcon }).addTo(mapa)

    setTimeout(() => mapa?.invalidateSize(), 100)
}

watch(() => props.show, async (visible) => {
    if (visible && tieneCoordenadas.value) {
        await nextTick()
        initMapa()
    } else if (!visible && mapa) {
        mapa.remove()
        mapa = null
    }
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