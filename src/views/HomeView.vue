<template>
    <div class="app-shell">

        <AlertaSonido :activa="despachos.nuevoPedido" />

        <!-- ══ HEADER ══ -->
        <header class="app-header">
            <div class="app-container flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p class="text-xs font-medium" style="color: var(--color-ink-faint)">Bienvenido</p>
                    <h1 class="font-black text-lg sm:text-xl leading-tight" style="color: var(--color-ink)">
                        {{ auth.user?.nombre }}
                    </h1>
                </div>

                <button @click="askToggleEstado" :disabled="loadingEstado || auth.isOcupado" class="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm
                           border-none cursor-pointer transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed" :class="auth.isDisponible
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : auth.isOcupado
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600'">
                    <div class="w-2 h-2 rounded-full"
                        :class="auth.isDisponible ? 'bg-white animate-pulse' : 'bg-current'" />
                    {{ auth.isOcupado ? 'Ocupado' : auth.isDisponible ? 'Disponible' : 'Inactivo' }}
                </button>
            </div>

            <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-1"
                leave-to-class="opacity-0">
                <div v-if="!auth.user?.verificado" class="app-container mt-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200
                           flex items-center gap-3">
                    <ClockIcon class="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                        <p class="font-bold text-[13px] text-amber-800 m-0">Cuenta pendiente de verificación</p>
                        <p class="text-[12px] text-amber-600 m-0 mt-0.5">
                            El administrador debe aprobar tu cuenta para que puedas recibir pedidos
                        </p>
                    </div>
                </div>
            </Transition>

            <Transition enter-active-class="transition-all duration-200" enter-from-class="opacity-0 -translate-y-1"
                leave-to-class="opacity-0">
                <button v-if="pushSupported && pushPermission !== 'granted'" @click="enablePush" :disabled="enablingPush"
                    class="app-container mt-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200 w-full
                           flex items-center gap-3 cursor-pointer text-left disabled:opacity-60">
                    <span v-if="enablingPush" class="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin shrink-0" />
                    <BellAlertIcon v-else class="w-6 h-6 text-blue-500 shrink-0" />
                    <div>
                        <p class="font-bold text-[13px] text-blue-800 m-0">
                            {{ enablingPush ? 'Activando...' : 'Activar notificaciones' }}
                        </p>
                        <p class="text-[12px] text-blue-600 m-0 mt-0.5">
                            Entérate de pedidos nuevos aunque tengas la pantalla apagada
                        </p>
                    </div>
                </button>
            </Transition>

            <p v-if="pushError" class="app-container mt-2 text-[12px] text-red-600 bg-red-50 border border-red-200
                   rounded-xl px-3 py-2">
                {{ pushError }}
            </p>
        </header>

        <!-- ══ PEDIDOS ACTIVOS (hasta 3 a la vez) ══ -->
        <div v-if="despachos.activos.length > 0" class="app-container px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between mt-4 mb-2">
                <span class="text-xs font-black uppercase tracking-widest text-amber-600">
                    Pedidos activos
                </span>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
                    {{ despachos.activos.length }} de {{ MAX_DESPACHOS_SIMULTANEOS }}
                </span>
            </div>

            <div class="flex flex-col gap-2.5">
                <div v-for="d in despachos.activos" :key="d.id" class="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300
                           cursor-pointer active:scale-[0.98] sm:hover:scale-[1.01] transition-all duration-150"
                    @click="router.push(`/despacho/${d.id}`)">
                    <div class="flex items-center justify-between mb-2">
                        <span v-if="d.negocio" class="text-[11px] font-bold text-amber-700 truncate">{{ d.negocio }}</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800 shrink-0 ml-auto">
                            {{ estadoLabel(d.estado) }}
                        </span>
                    </div>
                    <p class="font-black" style="color: var(--color-ink)">{{ d.order?.client_name }}</p>
                    <p class="text-sm text-gray-500 mt-0.5">
                        {{ d.order?.address }}, {{ d.order?.district }}
                    </p>
                    <p class="text-sm font-black mt-2" style="color: var(--color-brand-600)">Toca para ver el detalle →</p>
                </div>
            </div>
        </div>

        <!-- ══ PEDIDOS DISPONIBLES ══ -->
        <div class="flex-1 app-container px-4 sm:px-6 lg:px-8 py-4 pb-24 flex flex-col gap-3 overflow-y-auto">

            <div class="flex items-center justify-between mb-1">
                <h2 class="font-black text-lg sm:text-xl" style="color: var(--color-ink)">Pedidos disponibles</h2>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    {{ despachos.disponibles.length }}
                </span>
            </div>

            <div v-if="!despachos.puedeAceptarMas" class="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200">
                <InformationCircleIcon class="w-5 h-5 text-blue-500 shrink-0" />
                <p class="text-[12.5px] text-blue-700 m-0">
                    Ya tienes {{ MAX_DESPACHOS_SIMULTANEOS }} pedidos activos — el máximo permitido. Termina alguno para poder aceptar otro.
                </p>
            </div>

            <div v-if="despachos.disponibles.length === 0 && !loading" class="empty-state">
                <div class="empty-state-icon">
                    <TruckIcon class="w-8 h-8 text-gray-300" />
                </div>
                <div>
                    <p class="font-bold text-sm" style="color: var(--color-ink-soft)">Sin pedidos disponibles</p>
                    <p class="text-xs mt-1">Espera nuevos pedidos de delivery</p>
                </div>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <div v-for="n in 3" :key="n" class="h-36 rounded-2xl bg-gray-100 animate-pulse" />
            </div>

            <TransitionGroup name="pedido" tag="div"
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                <PedidoCard v-for="d in despachos.disponibles" :key="d.id" :despacho="d"
                    :aceptando="aceptandoId === d.id" :deshabilitado="!despachos.puedeAceptarMas"
                    :nuevo="despachos.esNuevo(d.id)" @ver-detalle="abrirDetalle(d)" />
            </TransitionGroup>
        </div>

        <!-- ══ NAV — visible en todas las pantallas ══ -->
        <AppNav active="home" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

        <!-- ══ MODALES DE CONFIRMACIÓN ══ -->
        <ConfirmModal v-model="confirmEstado.show"
            :title="confirmEstado.target === 'disponible' ? '¿Ponerte disponible?' : '¿Ponerte inactivo?'" :message="confirmEstado.target === 'disponible'
                ? 'Empezarás a recibir pedidos de delivery disponibles en tu zona.'
                : 'Dejarás de recibir nuevos pedidos hasta que vuelvas a activarte.'"
            :variant="confirmEstado.target === 'disponible' ? 'success' : 'warning'"
            :confirm-label="confirmEstado.target === 'disponible' ? 'Sí, ponerme disponible' : 'Sí, ponerme inactivo'"
            :loading="loadingEstado" @confirm="executeToggleEstado" />

        <DetallePedidoModal :show="detalleModal.show" :despacho="detalleModal.target" :aceptando="aceptandoId !== null"
            :deshabilitado="!despachos.puedeAceptarMas" @close="detalleModal.show = false" @aceptar="executeAceptar" />

        <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
            message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
            confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { TruckIcon, ClockIcon, InformationCircleIcon, BellAlertIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useDespachosStore, MAX_DESPACHOS_SIMULTANEOS } from '../stores/despacho'
import { useEcho } from '../composables/useEcho'
import api from '../api/axios'
import PedidoCard from '../components/PedidoCard.vue'
import AlertaSonido from '../components/AlertaSonido.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import DetallePedidoModal from '../components/DetallePedidoModal.vue'
import AppNav from '../components/AppNav.vue'
import type { DespachoItem, DespachoActualizadoEvent } from '../stores/despacho'

const router = useRouter()
const auth = useAuthStore()
const despachos = useDespachosStore()

const loading = ref(false)
const loadingEstado = ref(false)
const aceptandoId = ref<number | null>(null)
const errorMsg = ref('')
const loggingOut = ref(false)

const echo = useEcho()

// ── Notificaciones push (funcionan con la app cerrada/pantalla apagada) ──
const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
const pushPermission = ref<NotificationPermission>(pushSupported ? Notification.permission : 'denied')
const enablingPush = ref(false)
const pushError = ref('')

// El navegador entrega la llave VAPID en base64url — PushManager necesita
// un Uint8Array, no el string tal cual.
function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

async function enablePush() {
    if (!pushSupported || enablingPush.value) return
    enablingPush.value = true
    pushError.value = ''
    try {
        const permission = await Notification.requestPermission()
        pushPermission.value = permission
        if (permission !== 'granted') {
            pushError.value = 'No diste el permiso de notificaciones — sin eso no podemos avisarte.'
            return
        }

        // El service worker ya se registra solo (vite-plugin-pwa) — acá
        // solo esperamos a que esté listo para poder suscribirnos.
        const registration = await navigator.serviceWorker.ready

        const { data } = await api.get('/vapid-public-key')
        const publicKey = data.data?.public_key
        if (!publicKey) {
            pushError.value = 'El servidor no devolvió la llave necesaria (vapid-public-key vacío).'
            return
        }

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
        })

        await api.post('/motorizado/push/subscribe', subscription.toJSON())
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        pushError.value = `No se pudo activar: ${msg}`
    } finally {
        enablingPush.value = false
    }
}

onMounted(async () => {
    loading.value = true
    await Promise.all([despachos.fetchDisponibles(), despachos.fetchActivos()])
    loading.value = false

    echo.channel('motorizados')
        .listen('.pedido.disponible', (data: DespachoItem) => despachos.addDisponible(data))
        .listen('.despacho.actualizado', (data: DespachoActualizadoEvent) => {
            // Cualquier despacho que deje de estar "solicitado" (otro
            // motorizado lo aceptó, o se canceló) desaparece al instante
            // de la lista de disponibles de todos los demás.
            despachos.removeDisponible(data.despacho_id)
        })

    if (auth.user) {
        echo.channel(`motorizado.${auth.user.id}`)
            .listen('.despacho.actualizado', () => {
                despachos.fetchActivos()
            })
    }
})

onUnmounted(() => {
    echo.leaveChannel('motorizados')
    if (auth.user) echo.leaveChannel(`motorizado.${auth.user.id}`)
})

// ── Confirmar cambio de estado ──────────────────────────────
const confirmEstado = reactive({ show: false, target: '' as 'disponible' | 'inactivo' | '' })

function askToggleEstado() {
    if (auth.isOcupado) return
    confirmEstado.target = auth.isDisponible ? 'inactivo' : 'disponible'
    confirmEstado.show = true
}

async function executeToggleEstado() {
    loadingEstado.value = true
    await auth.updateEstado(confirmEstado.target as 'disponible' | 'inactivo')
    loadingEstado.value = false
    confirmEstado.show = false
}

// ── Detalle + aceptar pedido ────────────────────────────────
const detalleModal = reactive({ show: false, target: null as DespachoItem | null })

function abrirDetalle(d: DespachoItem) {
    despachos.marcarVisto(d.id)
    detalleModal.target = d
    detalleModal.show = true
}

async function executeAceptar() {
    const d = detalleModal.target
    if (!d || aceptandoId.value) return

    aceptandoId.value = d.id
    await nextTick()

    try {
        await despachos.aceptar(d.id)
        detalleModal.show = false
        router.push(`/despacho/${d.id}`)
    } catch (e: any) {
        errorMsg.value = e.message ?? 'Error al aceptar el pedido'
        setTimeout(() => { errorMsg.value = '' }, 3_000)
    } finally {
        aceptandoId.value = null
    }
}

// ── Confirmar logout ─────────────────────────────────────────
const confirmLogout = reactive({ show: false })

async function handleLogout() {
    loggingOut.value = true
    await auth.logout()
    loggingOut.value = false
    confirmLogout.show = false
    router.push('/login')
}

function estadoLabel(s: string): string {
    const m: Record<string, string> = { aceptado: 'Aceptado', recogido: 'Recogido' }
    return m[s] ?? s
}
</script>

<style scoped>
.pedido-enter-active {
    transition: all 0.3s ease;
}

.pedido-leave-active {
    transition: all 0.2s ease;
}

.pedido-enter-from {
    opacity: 0;
    transform: translateY(-12px);
}

.pedido-leave-to {
    opacity: 0;
    transform: translateX(20px);
}
</style>