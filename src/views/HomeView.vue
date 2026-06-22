<template>
    <div class="min-h-screen flex flex-col bg-gray-50">

        <AlertaSonido :activa="despachos.nuevoPedido" />

        <!-- ══ HEADER ══ -->
        <header class="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
            <div class="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <p class="text-xs text-gray-400 font-medium">Bienvenido</p>
                    <h1 class="font-black text-lg sm:text-xl text-gray-900 leading-tight">
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
                <div v-if="!auth.user?.verificado" class="max-w-4xl mx-auto mt-3 px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200
                           flex items-center gap-3">
                    <span class="text-xl shrink-0">⏳</span>
                    <div>
                        <p class="font-bold text-[13px] text-amber-800 m-0">Cuenta pendiente de verificación</p>
                        <p class="text-[12px] text-amber-600 m-0 mt-0.5">
                            El administrador debe aprobar tu cuenta para que puedas recibir pedidos
                        </p>
                    </div>
                </div>
            </Transition>
        </header>

        <!-- ══ DESPACHO ACTIVO ══ -->
        <div class="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div v-if="despachos.activo" class="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300
                       cursor-pointer active:scale-[0.98] sm:hover:scale-[1.01] transition-all duration-150"
                @click="router.push(`/despacho/${despachos.activo!.id}`)">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-black uppercase tracking-widest text-amber-600">Pedido activo</span>
                    <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                        {{ estadoLabel(despachos.activo.estado) }}
                    </span>
                </div>
                <p class="font-black text-gray-900">{{ despachos.activo.order?.client_name }}</p>
                <p class="text-sm text-gray-500 mt-0.5">
                    {{ despachos.activo.order?.address }}, {{ despachos.activo.order?.district }}
                </p>
                <p class="text-sm font-black text-red-600 mt-2">Toca para ver el detalle →</p>
            </div>
        </div>

        <!-- ══ PEDIDOS DISPONIBLES ══ -->
        <div class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-24 flex flex-col gap-3 overflow-y-auto">

            <div class="flex items-center justify-between mb-1">
                <h2 class="font-black text-gray-900 text-lg sm:text-xl">Pedidos disponibles</h2>
                <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    {{ despachos.disponibles.length }}
                </span>
            </div>

            <div v-if="despachos.disponibles.length === 0 && !loading"
                class="flex flex-col items-center py-16 text-gray-400 gap-3">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                </div>
                <div class="text-center">
                    <p class="font-bold text-gray-600 text-sm">Sin pedidos disponibles</p>
                    <p class="text-xs mt-1">Espera nuevos pedidos de delivery</p>
                </div>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div v-for="n in 3" :key="n" class="h-36 rounded-2xl bg-gray-100 animate-pulse" />
            </div>

            <TransitionGroup name="pedido" tag="div" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <PedidoCard v-for="d in despachos.disponibles" :key="d.id" :despacho="d"
                    :aceptando="aceptandoId === d.id" @aceptar="askAceptar(d)" />
            </TransitionGroup>
        </div>

        <!-- ══ NAV — visible en todas las pantallas ══ -->
        <BottomNav active="home" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

        <!-- ══ MODALES DE CONFIRMACIÓN ══ -->
        <ConfirmModal v-model="confirmEstado.show"
            :title="confirmEstado.target === 'disponible' ? '¿Ponerte disponible?' : '¿Ponerte inactivo?'" :message="confirmEstado.target === 'disponible'
                ? 'Empezarás a recibir pedidos de delivery disponibles en tu zona.'
                : 'Dejarás de recibir nuevos pedidos hasta que vuelvas a activarte.'"
            :variant="confirmEstado.target === 'disponible' ? 'success' : 'warning'"
            :confirm-label="confirmEstado.target === 'disponible' ? 'Sí, ponerme disponible' : 'Sí, ponerme inactivo'"
            :loading="loadingEstado" @confirm="executeToggleEstado" />

        <ConfirmModal v-model="confirmAceptar.show" title="¿Aceptar este pedido?"
            :message="`Vas a comprometerte a recoger el pedido de ${confirmAceptar.target?.order?.client_name} y entregarlo. Una vez aceptado no podrás tomar otros pedidos hasta completarlo.`"
            variant="info" confirm-label="Sí, aceptar pedido" :loading="aceptandoId !== null"
            @confirm="executeAceptar" />

        <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
            message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
            confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDespachosStore } from '../stores/despacho'
import { useEcho } from '../composables/useEcho'
import PedidoCard from '../components/PedidoCard.vue'
import AlertaSonido from '../components/AlertaSonido.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import BottomNav from '../components/BottomNav.vue'
import type { DespachoItem } from '../stores/despacho'

const router = useRouter()
const auth = useAuthStore()
const despachos = useDespachosStore()

const loading = ref(false)
const loadingEstado = ref(false)
const aceptandoId = ref<number | null>(null)
const errorMsg = ref('')
const loggingOut = ref(false)

const echo = useEcho()

onMounted(async () => {
    loading.value = true
    await Promise.all([despachos.fetchDisponibles(), despachos.fetchActivo()])
    loading.value = false

    echo.channel('motorizados')
        .listen('.pedido.disponible', (data: any) => despachos.addDisponible(data))

    if (auth.user) {
        echo.channel(`motorizado.${auth.user.id}`)
            .listen('.despacho.actualizado', (data: any) => {
                if (data.estado === 'aceptado' && data.motorizado?.id !== auth.user?.id) {
                    despachos.removeDisponible(data.despacho_id)
                }
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

// ── Confirmar aceptar pedido ────────────────────────────────
const confirmAceptar = reactive({ show: false, target: null as DespachoItem | null })

function askAceptar(d: DespachoItem) {
    confirmAceptar.target = d
    confirmAceptar.show = true
}

async function executeAceptar() {
    const d = confirmAceptar.target
    if (!d || aceptandoId.value) return
    aceptandoId.value = d.id
    try {
        await despachos.aceptar(d.id)
        confirmAceptar.show = false
        router.push(`/despacho/${d.id}`)
    } catch (e: any) {
        errorMsg.value = e.message
        confirmAceptar.show = false
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