<template>
    <div class="min-h-screen flex flex-col bg-gray-50">

        <!-- Header -->
        <header class="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
            <div class="max-w-2xl mx-auto flex items-center gap-3">
                <button @click="router.push('/')" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                           border-none cursor-pointer hover:bg-gray-200 transition-colors shrink-0">
                    ←
                </button>
                <div>
                    <h1 class="font-black text-lg sm:text-xl text-gray-900 leading-tight">
                        Pedido #{{ despacho?.order_id }}
                    </h1>
                    <p class="text-xs text-gray-400">{{ estadoLabel(despacho?.estado ?? '') }}</p>
                </div>
            </div>
        </header>

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
            <div class="w-8 h-8 border-2 border-gray-200 border-t-red-600 rounded-full animate-spin" />
        </div>

        <template v-else-if="despacho">
            <div class="max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 pb-24">

                <!-- ══ TIMELINE ══ -->
                <div class="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-2">
                    <div v-for="(step, i) in STEPS" :key="step.value" class="flex-1 flex flex-col items-center gap-1">
                        <div class="flex items-center w-full">
                            <div class="w-7 h-7 rounded-full border-2 flex items-center justify-center
                                        text-xs font-black shrink-0" :class="stepDone(step.value)
                                            ? 'bg-red-600 border-red-600 text-white'
                                            : stepActive(step.value)
                                                ? 'bg-red-50 border-red-600 text-red-600'
                                                : 'bg-white border-gray-200 text-gray-300'">
                                <span v-if="stepDone(step.value)">✓</span>
                            </div>
                            <div v-if="i < STEPS.length - 1" class="flex-1 h-0.5 mx-1"
                                :class="stepDone(step.value) ? 'bg-red-600' : 'bg-gray-100'" />
                        </div>
                        <span class="text-[9px] sm:text-[10px] font-bold text-center"
                            :class="stepActive(step.value) ? 'text-red-600' : 'text-gray-400'">
                            {{ step.label }}
                        </span>
                    </div>
                </div>

                <!-- ══ BANNER MÉTODO DE PAGO ══ -->
                <div v-if="despacho.order?.metodo_pago" class="mt-3 px-4 py-3 rounded-2xl flex items-center gap-3"
                    :class="esContraentrega
                        ? 'bg-amber-50 border border-amber-200'
                        : 'bg-green-50 border border-green-200'">
                    <span class="text-xl shrink-0">
                        {{ despacho.order.metodo_pago === 'contraentrega_yape' ? '📱'
                            : despacho.order.metodo_pago === 'contraentrega_efectivo' ? '💵' : '💳' }}
                    </span>
                    <div>
                        <p class="font-bold text-[13px] m-0"
                            :class="esContraentrega ? 'text-amber-800' : 'text-green-800'">
                            {{ metodoPagoLabel(despacho.order.metodo_pago) }}
                        </p>
                        <p class="text-[11.5px] m-0 mt-0.5"
                            :class="esContraentrega ? 'text-amber-600' : 'text-green-600'">
                            {{ esContraentrega
                                ? 'Debes cobrar al entregar el pedido'
                                : 'El cliente ya pagó, solo entrega' }}
                        </p>
                    </div>
                </div>

                <!-- ══ GRID INFO CLIENTE + DETALLE PEDIDO ══ -->
                <div class="grid lg:grid-cols-2 gap-3 mt-3">

                    <!-- INFO CLIENTE -->
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">

                        <!-- Badge restaurante -->
                        <span v-if="despacho.restaurant" class="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full
                                   bg-purple-50 text-purple-700 border border-purple-200 self-start">
                            {{ despacho.restaurant }}
                        </span>

                        <!-- Nombre cliente -->
                        <h2 class="font-black text-gray-900 text-[16px] m-0">
                            {{ despacho.order?.client_name }}
                        </h2>

                        <!-- Llamar al cliente -->
                        <a :href="`tel:${despacho.order?.client_phone}`"
                            class="flex items-center gap-3 no-underline group">
                            <div class="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center
                                        shrink-0 group-hover:bg-green-100 transition-colors">
                                <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10.5px] text-gray-400 font-medium m-0">Llamar al cliente</p>
                                <p class="font-bold text-gray-900 text-sm m-0">
                                    {{ despacho.order?.client_phone }}
                                </p>
                            </div>
                        </a>

                        <!-- Dirección -->
                        <div class="flex items-start gap-3">
                            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center
                                        shrink-0 mt-0.5">
                                <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[10.5px] text-gray-400 font-medium m-0">Dirección de entrega</p>
                                <p class="font-bold text-gray-900 text-sm m-0">
                                    {{ despacho.order?.address }}
                                </p>
                                <p v-if="despacho.order?.district" class="text-xs text-gray-500 m-0 mt-0.5">
                                    {{ despacho.order.district }}
                                </p>
                            </div>
                        </div>

                        <!-- Referencia — DESTACADA -->
                        <div v-if="despacho.order?.reference"
                            class="px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
                            <p class="text-[10.5px] font-black text-amber-600 uppercase tracking-wider m-0 mb-0.5">
                                📍 Referencia
                            </p>
                            <p class="text-[13px] font-bold text-amber-900 m-0">
                                {{ despacho.order.reference }}
                            </p>
                        </div>

                        <!-- Nota del cliente -->
                        <div v-if="despacho.order?.note"
                            class="px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                            <p class="text-[10.5px] font-black text-gray-400 uppercase tracking-wider m-0 mb-0.5">
                                💬 Nota del cliente
                            </p>
                            <p class="text-[12.5px] text-gray-700 m-0">{{ despacho.order.note }}</p>
                        </div>

                        <!-- Mapa del cliente (si hay coordenadas GPS) -->
                        <div v-if="despacho.order?.lat && despacho.order?.lng" class="flex flex-col gap-2">
                            <p class="text-[10.5px] font-black text-gray-400 uppercase tracking-wider m-0">
                                Ubicación exacta del cliente
                            </p>
                            <!-- ↓ CAMBIO: clase dinámica para bajar z-index cuando hay modal abierto -->
                            <div id="cliente-map"
                                class="w-full h-44 rounded-2xl overflow-hidden border-2 border-gray-100"
                                :class="{ 'relative !z-0': modalAbierto }" />
                            <a :href="`https://www.google.com/maps/dir/?api=1&destination=${despacho.order.lat},${despacho.order.lng}`"
                                target="_blank" class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                                       bg-blue-600 text-white font-bold text-[13px] no-underline
                                       hover:bg-blue-700 active:scale-[0.98] transition-all duration-150">
                                🗺️ Navegar con Google Maps
                            </a>
                        </div>

                        <!-- Sin coordenadas GPS — botón de búsqueda por texto -->
                        <a v-else :href="mapsLink" target="_blank" class="w-full flex items-center justify-center gap-2 py-3 rounded-2xl
                                   bg-blue-600 text-white font-bold text-[13px] no-underline
                                   hover:bg-blue-700 active:scale-[0.98] transition-all duration-150">
                            🗺️ Abrir en Google Maps
                        </a>
                    </div>

                    <!-- DETALLE DEL PEDIDO -->
                    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-fit">

                        <div class="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                            <h3 class="font-black text-gray-900 text-sm m-0">Detalle del pedido</h3>
                        </div>

                        <!-- Items -->
                        <div class="divide-y divide-gray-50">
                            <div v-for="item in despacho.order?.items" :key="item.name"
                                class="flex items-start justify-between px-4 py-3 gap-3">
                                <div class="flex-1 min-w-0">
                                    <p class="text-[13.5px] text-gray-900 font-semibold m-0">
                                        {{ item.name }}
                                    </p>
                                    <p v-if="item.custom_summary"
                                        class="text-[11px] text-gray-400 m-0 mt-0.5 leading-relaxed">
                                        {{ item.custom_summary }}
                                    </p>
                                    <p v-if="item.unit_price" class="text-[11.5px] text-gray-400 m-0 mt-0.5">
                                        S/ {{ Number(item.unit_price).toFixed(2) }} c/u
                                    </p>
                                </div>
                                <div class="flex flex-col items-end gap-0.5 shrink-0">
                                    <span class="text-xs font-black text-gray-500 bg-gray-100
                                                 px-2 py-0.5 rounded-lg">
                                        x{{ item.qty }}
                                    </span>
                                    <span v-if="item.subtotal" class="text-[12px] font-bold text-gray-700">
                                        S/ {{ Number(item.subtotal).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Totales desglosados -->
                        <div class="px-4 py-3 border-t border-gray-100 flex flex-col gap-1.5 bg-gray-50/50">
                            <div v-if="despacho.order?.subtotal"
                                class="flex items-center justify-between text-[12.5px]">
                                <span class="text-gray-500">Subtotal</span>
                                <span class="font-semibold text-gray-700">
                                    S/ {{ Number(despacho.order.subtotal).toFixed(2) }}
                                </span>
                            </div>
                            <div v-if="despacho.order?.delivery_fee"
                                class="flex items-center justify-between text-[12.5px]">
                                <span class="text-gray-500">Delivery</span>
                                <span class="font-semibold text-blue-600">
                                    S/ {{ Number(despacho.order.delivery_fee).toFixed(2) }}
                                </span>
                            </div>
                            <div class="flex items-center justify-between pt-1.5 border-t border-gray-200">
                                <span class="font-bold text-[13px] text-gray-700">Total</span>
                                <div class="flex items-baseline gap-0.5">
                                    <span class="text-[11px] text-gray-400">S/</span>
                                    <span class="font-black text-[18px] text-red-600 leading-none">
                                        {{ Number(despacho.order?.total).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Comisión del motorizado -->
                        <div class="px-4 py-3 border-t border-gray-100 flex items-center
                                    justify-between bg-purple-50/50">
                            <span class="text-[12px] text-purple-600 font-medium">
                                Tu comisión por esta entrega
                            </span>
                            <div class="flex items-baseline gap-0.5">
                                <span class="text-[10px] text-purple-400">S/</span>
                                <span class="font-black text-[15px] text-purple-700 leading-none">
                                    {{ Number(despacho.comision_motorizado).toFixed(2) }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ══ BOTÓN DE ACCIÓN ══ -->
                <div class="mt-4 mb-6 sm:max-w-md sm:mx-auto lg:max-w-none">

                    <button v-if="despacho.estado === 'aceptado'" @click="confirmRecojo.show = true"
                        :disabled="loadingAccion" class="w-full py-4 rounded-2xl bg-amber-500 text-white font-black
                               text-sm uppercase tracking-wide border-none cursor-pointer
                               shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-[0.98]
                               disabled:opacity-50 transition-all duration-150
                               flex items-center justify-center gap-2">
                        📦 Confirmar recojo en local
                    </button>

                    <button v-else-if="despacho.estado === 'recogido'"
                        @click="esContraentrega ? abrirModalCobro() : (confirmEntrega.show = true)"
                        :disabled="loadingAccion" class="w-full py-4 rounded-2xl bg-green-600 text-white font-black
                               text-sm uppercase tracking-wide border-none cursor-pointer
                               shadow-lg shadow-green-600/30 hover:bg-green-700 active:scale-[0.98]
                               disabled:opacity-50 transition-all duration-150
                               flex items-center justify-center gap-2">
                        ✅ Confirmar entrega
                    </button>

                    <div v-else-if="despacho.estado === 'entregado'" class="text-center py-6">
                        <div class="w-16 h-16 rounded-full bg-green-100 flex items-center
                                    justify-center mx-auto mb-3">
                            <span class="text-3xl">✅</span>
                        </div>
                        <p class="font-black text-gray-900">¡Entregado!</p>
                        <p class="text-sm text-gray-400 mt-1">Pedido completado exitosamente</p>
                        <button @click="router.push('/')" class="mt-4 px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold
                                   text-sm border-none cursor-pointer hover:bg-red-700 transition-colors">
                            Volver al inicio
                        </button>
                    </div>
                </div>
            </div>
        </template>

        <!-- ══ NAV FIJO ══ -->
        <BottomNav active="" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

        <!-- ══ MODALES ══ -->
        <ConfirmModal v-model="confirmRecojo.show" title="¿Confirmar recojo en el local?"
            message="Confirma que ya recogiste el pedido en el restaurante y vas en camino hacia el cliente."
            variant="warning" confirm-label="Sí, ya lo recogí" :loading="loadingAccion" @confirm="executeRecojo" />

        <ConfirmModal v-model="confirmEntrega.show" title="¿Confirmar entrega?"
            message="Confirma que ya entregaste el pedido al cliente. Esta acción no se puede deshacer."
            variant="success" confirm-label="Sí, ya lo entregué" :loading="loadingAccion" @confirm="executeEntrega" />

        <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
            message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
            confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />

        <!-- Modal cobro contraentrega -->
        <Teleport to="body">
            <Transition enter-active-class="transition-opacity duration-200"
                leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
                leave-to-class="opacity-0">
                <div v-if="modalCobro.show" class="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm
                           flex items-center justify-center p-4" @click.self="modalCobro.show = false">
                    <Transition enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 scale-95" leave-to-class="opacity-0 scale-95">
                        <div v-if="modalCobro.show" class="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
                            <div class="w-14 h-14 rounded-2xl bg-green-50 mx-auto mb-4
                                        flex items-center justify-center">
                                <span class="text-2xl">
                                    {{ despacho?.order?.metodo_pago === 'contraentrega_yape' ? '📱' : '💵' }}
                                </span>
                            </div>
                            <h3 class="font-black text-[18px] text-gray-900 m-0 mb-1 text-center">
                                Confirmar cobro
                            </h3>
                            <p class="text-[13px] text-gray-400 m-0 mb-5 text-center">
                                {{ despacho?.order?.metodo_pago === 'contraentrega_yape'
                                    ? 'Confirma que recibiste el pago por Yape/Plin'
                                    : 'Confirma el monto recibido en efectivo' }}
                            </p>
                            <div class="bg-gray-50 rounded-2xl p-4 mb-4 flex items-center
                                        justify-between border border-gray-100">
                                <span class="text-[13px] font-semibold text-gray-600">Total del pedido</span>
                                <div class="flex items-baseline gap-0.5">
                                    <span class="text-[12px] text-gray-400">S/</span>
                                    <span class="font-black text-[20px] text-gray-900 leading-none">
                                        {{ Number(despacho?.order?.total).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                            <div class="flex flex-col gap-1.5 mb-5">
                                <label class="text-[10.5px] font-black uppercase tracking-widest text-gray-400">
                                    Monto cobrado (S/)
                                </label>
                                <input v-model="modalCobro.monto" type="number" step="0.50" min="0" class="w-full px-4 py-3 rounded-2xl border-2 border-gray-100
                                           bg-gray-50 text-[16px] font-bold text-gray-900 outline-none
                                           focus:border-green-500 focus:bg-white transition-all duration-200" />
                            </div>
                            <div class="flex gap-3">
                                <button @click="modalCobro.show = false" class="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600
                                           font-semibold text-[13.5px] cursor-pointer bg-white
                                           hover:border-gray-300 transition-all duration-150">
                                    Cancelar
                                </button>
                                <button @click="confirmarCobro" :disabled="loadingAccion" class="flex-1 py-3 rounded-2xl text-white font-bold text-[13.5px]
                                           cursor-pointer border-none bg-green-600 hover:bg-green-700
                                           disabled:opacity-50 transition-all duration-150
                                           flex items-center justify-center gap-2">
                                    <span v-if="loadingAccion" class="w-4 h-4 border-2 border-white/30 border-t-white
                                               rounded-full animate-spin" />
                                    {{ loadingAccion ? 'Confirmando...' : 'Confirmar' }}
                                </button>
                            </div>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDespachosStore } from '../stores/despacho'
import { useEcho } from '../composables/useEcho'
import { useAuthStore } from '../stores/auth'
import ConfirmModal from '../components/ConfirmModal.vue'
import BottomNav from '../components/BottomNav.vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// ── Stores y router ───────────────────────────────────────
const router = useRouter()
const route = useRoute()
const despachos = useDespachosStore()
const auth = useAuthStore()

// ── Estado ────────────────────────────────────────────────
const loading = ref(false)
const loadingAccion = ref(false)
const loggingOut = ref(false)
const despacho = ref<any>(null)
let clienteMap: L.Map | null = null

// ── Modales ───────────────────────────────────────────────
const confirmRecojo = reactive({ show: false })
const confirmEntrega = reactive({ show: false })
const confirmLogout = reactive({ show: false })
const modalCobro = reactive({ show: false, monto: 0 })

// ── Detectar si hay algún modal abierto (para bajar z-index del mapa) ──
const modalAbierto = computed(() =>
    confirmRecojo.show || confirmEntrega.show || confirmLogout.show || modalCobro.show
)

// ── Constantes ────────────────────────────────────────────
const STEPS = [
    { value: 'aceptado', label: 'Aceptado' },
    { value: 'recogido', label: 'Recogido' },
    { value: 'entregado', label: 'Entregado' },
]
const FLOW = ['aceptado', 'recogido', 'entregado']

// ── Computados ────────────────────────────────────────────
const esContraentrega = computed(() =>
    ['contraentrega_efectivo', 'contraentrega_yape']
        .includes(despacho.value?.order?.metodo_pago ?? '')
)

const mapsLink = computed(() => {
    const o = despacho.value?.order
    if (!o) return '#'
    if (o.lat && o.lng) {
        return `https://www.google.com/maps/dir/?api=1&destination=${o.lat},${o.lng}`
    }
    const query = encodeURIComponent(`${o.address}, ${o.district ?? ''}`)
    return `https://maps.google.com/?q=${query}`
})

// ── Helpers de etiquetas ─────────────────────────────────
function stepDone(val: string): boolean {
    return FLOW.indexOf(val) < FLOW.indexOf(despacho.value?.estado ?? '')
}

function stepActive(val: string): boolean {
    return despacho.value?.estado === val
}

function estadoLabel(s: string): string {
    const m: Record<string, string> = {
        aceptado: 'Ve al local a recoger',
        recogido: 'En camino al cliente',
        entregado: 'Entregado',
    }
    return m[s] ?? s
}

function metodoPagoLabel(m: string): string {
    const map: Record<string, string> = {
        anticipado: 'Pago anticipado',
        contraentrega_efectivo: 'Cobrar en efectivo',
        contraentrega_yape: 'Cobrar por Yape/Plin',
    }
    return map[m] ?? m
}

// ── Mapa del cliente ──────────────────────────────────────
function destroyMap() {
    if (clienteMap) {
        clienteMap.remove()
        clienteMap = null
    }
}

async function reinitMap() {
    const o = despacho.value?.order
    if (!o?.lat || !o?.lng) return
    await nextTick()
    // Esperar a que el DOM esté listo tras la transición
    setTimeout(() => initClienteMap(), 50)
}

function initClienteMap() {
    const o = despacho.value?.order
    if (!o?.lat || !o?.lng) return

    const el = document.getElementById('cliente-map')
    if (!el) return

    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2x,
        shadowUrl: markerShadow,
    })

    if (clienteMap) { clienteMap.remove(); clienteMap = null }

    clienteMap = L.map('cliente-map', {
        center: [o.lat, o.lng],
        zoom: 17,
        zoomControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
    }).addTo(clienteMap)

    const redIcon = L.divIcon({
        className: '',
        html: `<div style="
            width:28px;height:28px;background:#dc2626;border:3px solid white;
            border-radius:50% 50% 50% 0;transform:rotate(-45deg);
            box-shadow:0 2px 8px rgba(220,38,38,0.5);
        "></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
    })

    L.marker([o.lat, o.lng], { icon: redIcon }).addTo(clienteMap)

    // ← NUEVO: forzar recalculo de tamaño
    setTimeout(() => {
        clienteMap?.invalidateSize()
    }, 100)
}

watch(() => despacho.value?.estado, async (nuevoEstado) => {
    if (nuevoEstado) {
        await reinitMap()
    }
})

// ── Lifecycle ─────────────────────────────────────────────
onMounted(async () => {
    const id = Number(route.params.id)
    loading.value = true

    if (despachos.activo?.id === id) {
        despacho.value = despachos.activo
    } else {
        await despachos.fetchActivo()
        despacho.value = despachos.activo
    }
    loading.value = false

    if (despacho.value?.order?.lat && despacho.value?.order?.lng) {
        await nextTick()
        initClienteMap()
    }

    const echo = useEcho()
    if (auth.user) {
        echo.channel(`motorizado.${auth.user.id}`)
            .listen('.despacho.actualizado', (data: any) => {
                if (data.despacho_id === id) {
                    despacho.value = { ...despacho.value, ...data }
                }
            })
    }
})

onUnmounted(() => {
    destroyMap()
})

// ── Acciones ──────────────────────────────────────────────
async function handleLogout() {
    loggingOut.value = true
    await auth.logout()
    loggingOut.value = false
    confirmLogout.show = false
    router.push('/login')
}

async function executeRecojo() {
    if (!despacho.value) return

    confirmRecojo.show = false
    destroyMap()
    const estadoAnterior = despacho.value.estado
    despacho.value = { ...despacho.value, estado: 'recogido' }
    loadingAccion.value = true

    const ok = await despachos.updateEstado(despacho.value.id, 'recogido')
    if (!ok) {
        despacho.value = { ...despacho.value, estado: estadoAnterior }
    }
    loadingAccion.value = false
    // El watch reinicia el mapa automáticamente
}

async function executeEntrega() {
    if (!despacho.value) return

    confirmEntrega.show = false
    // ← ya no llames destroyMap() aquí
    const estadoAnterior = despacho.value.estado
    despacho.value = { ...despacho.value, estado: 'entregado' }
    loadingAccion.value = true

    const ok = await despachos.updateEstado(despacho.value.id, 'entregado')
    if (ok) {
        await auth.updateEstado('disponible')
    } else {
        despacho.value = { ...despacho.value, estado: estadoAnterior }
    }
    loadingAccion.value = false
}

async function confirmarCobro() {
    if (!despacho.value) return

    modalCobro.show = false
    // ← ya no llames destroyMap() aquí
    const estadoAnterior = despacho.value.estado
    const montoCapturado = modalCobro.monto
    despacho.value = { ...despacho.value, estado: 'entregado' }
    loadingAccion.value = true

    const ok = await despachos.updateEstado(
        despacho.value.id, 'entregado', undefined, montoCapturado
    )
    if (ok) {
        await auth.updateEstado('disponible')
    } else {
        despacho.value = { ...despacho.value, estado: estadoAnterior }
        modalCobro.show = true
    }
    loadingAccion.value = false
}

</script>