<template>
  <div class="min-h-screen flex flex-col bg-gray-50">

    <!-- Header -->
    <header class="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
      <div class="max-w-4xl mx-auto flex items-center gap-3">
        <button @click="router.push('/')" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                           border-none cursor-pointer hover:bg-gray-200 transition-colors shrink-0">
          ←
        </button>
        <div>
          <h1 class="font-black text-lg sm:text-xl text-gray-900 leading-tight">Historial</h1>
          <p class="text-xs text-gray-400">Tus entregas completadas</p>
        </div>
      </div>
    </header>

    <!-- Stats del día -->
    <div class="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-4">
      <div class="grid grid-cols-2 gap-3 sm:gap-4">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Entregas hoy
          </p>
          <p class="font-black text-2xl sm:text-3xl text-gray-900 leading-none">
            {{ totalHoy }}
          </p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Ganancia hoy
          </p>
          <div class="flex items-baseline gap-0.5">
            <span class="text-xs text-gray-400">S/</span>
            <p class="font-black text-2xl sm:text-3xl text-red-600 leading-none">
              {{ gananciaHoy.toFixed(2) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista -->
    <div class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-24">

      <div v-if="despachos.loading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="n in 4" :key="n" class="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      </div>

      <div v-else-if="despachos.historial.length === 0" class="flex flex-col items-center py-16 text-gray-400 gap-3">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg class="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p class="font-bold text-gray-600 text-sm">Sin entregas todavía</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div v-for="d in despachos.historial" :key="d.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4
                           flex items-center gap-3 cursor-pointer
                           hover:border-red-200 hover:shadow-md transition-all duration-150
                           active:scale-[0.98]" @click="abrirDetalle(d)">
          <div class="w-10 h-10 rounded-xl bg-green-50 border border-green-200
                                flex items-center justify-center shrink-0">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-[11px] font-mono font-black text-gray-500">
                #{{ d.order_id }}
              </span>
              <span class="font-bold text-[13px] text-gray-900 truncate">
                {{ d.order?.client_name }}
              </span>
              <span v-if="d.restaurant" class="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full
                                       bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                {{ d.restaurant }}
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <p class="text-[12px] text-gray-400 m-0">
                {{ d.entregado_at ? formatHora(d.entregado_at) : '' }}
              </p>
              <span v-if="d.order?.metodo_pago && esContraentrega(d)" class="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full
                                       bg-amber-50 text-amber-700 border border-amber-200">
                {{ d.order.metodo_pago === 'contraentrega_yape' ? '📱 Yape' : '💵 Efectivo' }}
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-0.5 shrink-0">
            <div class="flex items-baseline gap-0.5">
              <span class="text-[10px] text-gray-400">S/</span>
              <span class="font-black text-base text-red-600 leading-none">
                {{ Number(d.order?.total ?? 0).toFixed(2) }}
              </span>
            </div>
            <span class="text-[10px] text-purple-500 font-medium">
              +S/ {{ Number(d.comision_motorizado ?? 0).toFixed(2) }} com.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Nav -->
    <BottomNav active="historial" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

    <!-- Modal logout -->
    <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
      message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
      confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />

    <!-- ══ MODAL DETALLE DEL DESPACHO ══ -->
    <Teleport to="body">
      <Transition enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-150" enter-from-class="opacity-0" leave-to-class="opacity-0">
        <div v-if="detalle.show" class="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm
                           flex items-end sm:items-center justify-center p-0 sm:p-4"
          @click.self="detalle.show = false">
          <Transition enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            leave-to-class="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95">
            <div v-if="detalle.show && detalle.item" class="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl
                                   shadow-2xl max-h-[90vh] overflow-y-auto">

              <!-- Handle móvil -->
              <div class="flex justify-center pt-3 pb-1 sm:hidden">
                <div class="w-10 h-1 rounded-full bg-gray-200" />
              </div>

              <div class="p-6">
                <!-- Header del modal -->
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[11px] font-mono font-black text-gray-500">
                        #{{ detalle.item.order_id }}
                      </span>
                      <span v-if="detalle.item.restaurant" class="text-[10px] font-bold px-2 py-0.5 rounded-full
                                                       bg-purple-50 text-purple-700 border border-purple-200">
                        {{ detalle.item.restaurant }}
                      </span>
                    </div>
                    <h3 class="font-black text-[18px] text-gray-900 m-0">
                      {{ detalle.item.order?.client_name }}
                    </h3>
                    <p class="text-xs text-gray-400 m-0 mt-0.5">
                      Entregado {{ detalle.item.entregado_at
                        ? formatFecha(detalle.item.entregado_at) : '' }}
                    </p>
                  </div>
                  <button @click="detalle.show = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center
                                               justify-center border-none cursor-pointer
                                               hover:bg-gray-200 transition-colors shrink-0">
                    ✕
                  </button>
                </div>

                <!-- Dirección -->
                <div class="flex items-start gap-2.5 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center
                                                justify-center shrink-0 mt-0.5">
                    <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-[10.5px] text-gray-400 font-medium m-0">
                      Dirección entregada
                    </p>
                    <p class="font-semibold text-[13px] text-gray-900 m-0">
                      {{ detalle.item.order?.address }}
                    </p>
                    <p v-if="detalle.item.order?.reference" class="text-[11.5px] text-amber-700 font-medium m-0 mt-0.5">
                      📍 {{ detalle.item.order.reference }}
                    </p>
                  </div>
                </div>

                <!-- Items del pedido -->
                <div class="bg-gray-50 rounded-2xl overflow-hidden mb-4">
                  <div class="px-4 py-2.5 border-b border-gray-100">
                    <p class="text-[10.5px] font-black text-gray-400
                                                   uppercase tracking-wider m-0">
                      Productos
                    </p>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="item in detalle.item.order?.items" :key="item.name"
                      class="flex items-start justify-between px-4 py-3 gap-3">
                      <div class="flex-1 min-w-0">
                        <p class="text-[13px] font-semibold text-gray-900 m-0">
                          {{ item.name }}
                        </p>
                        <p v-if="item.custom_summary" class="text-[11px] text-gray-400 m-0 mt-0.5 leading-relaxed">
                          {{ item.custom_summary }}
                        </p>
                        <p v-if="item.unit_price" class="text-[11px] text-gray-400 m-0 mt-0.5">
                          S/ {{ Number(item.unit_price).toFixed(2) }} c/u
                        </p>
                      </div>
                      <div class="flex flex-col items-end gap-0.5 shrink-0">
                        <span class="text-xs font-black text-gray-500
                                                             bg-white px-2 py-0.5 rounded-lg
                                                             border border-gray-200">
                          x{{ item.qty }}
                        </span>
                        <span v-if="item.subtotal" class="text-[12px] font-bold text-gray-700">
                          S/ {{ Number(item.subtotal).toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Totales -->
                <div class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 mb-4">
                  <div v-if="detalle.item.order?.subtotal" class="flex justify-between text-[12.5px]">
                    <span class="text-gray-500">Subtotal productos</span>
                    <span class="font-semibold text-gray-700">
                      S/ {{ Number(detalle.item.order.subtotal).toFixed(2) }}
                    </span>
                  </div>
                  <div v-if="detalle.item.order?.delivery_fee" class="flex justify-between text-[12.5px]">
                    <span class="text-gray-500">Costo de delivery</span>
                    <span class="font-semibold text-blue-600">
                      S/ {{ Number(detalle.item.order.delivery_fee).toFixed(2) }}
                    </span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200">
                    <span class="font-bold text-[13px] text-gray-700">Total</span>
                    <div class="flex items-baseline gap-0.5">
                      <span class="text-[11px] text-gray-400">S/</span>
                      <span class="font-black text-[18px] text-red-600 leading-none">
                        {{ Number(detalle.item.order?.total ?? 0).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Comisión -->
                <div class="bg-purple-50 rounded-2xl p-4 flex items-center
                                            justify-between border border-purple-100">
                  <div>
                    <p class="text-[10.5px] font-black text-purple-500
                                                   uppercase tracking-wider m-0 mb-0.5">
                      Tu comisión
                    </p>
                    <p class="text-[12px] text-purple-600 m-0">
                      Por esta entrega
                    </p>
                  </div>
                  <div class="flex items-baseline gap-0.5">
                    <span class="text-[11px] text-purple-400">S/</span>
                    <span class="font-black text-[22px] text-purple-700 leading-none">
                      {{ Number(detalle.item.comision_motorizado ?? 0).toFixed(2) }}
                    </span>
                  </div>
                </div>

                <!-- Monto cobrado (si fue contraentrega) -->
                <div v-if="detalle.item.monto_cobrado" class="mt-3 bg-green-50 rounded-2xl p-4 flex items-center
                                           justify-between border border-green-100">
                  <div>
                    <p class="text-[10.5px] font-black text-green-600
                                                   uppercase tracking-wider m-0 mb-0.5">
                      Monto cobrado
                    </p>
                    <p class="text-[12px] text-green-700 m-0">
                      {{ detalle.item.order?.metodo_pago === 'contraentrega_yape'
                        ? 'Recibido por Yape/Plin' : 'Recibido en efectivo' }}
                    </p>
                  </div>
                  <div class="flex items-baseline gap-0.5">
                    <span class="text-[11px] text-green-400">S/</span>
                    <span class="font-black text-[22px] text-green-700 leading-none">
                      {{ Number(detalle.item.monto_cobrado).toFixed(2) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDespachosStore } from '../stores/despacho'
import BottomNav from '../components/BottomNav.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import type { DespachoItem } from '../stores/despacho'

const router = useRouter()
const auth = useAuthStore()
const despachos = useDespachosStore()
const loggingOut = ref(false)

// ── Stats calculadas localmente desde el historial ────────
const hoy = new Date().toDateString()

const totalHoy = computed(() =>
  despachos.historial.filter(d =>
    d.entregado_at && new Date(d.entregado_at).toDateString() === hoy
  ).length
)

const gananciaHoy = computed(() =>
  despachos.historial
    .filter(d => d.entregado_at && new Date(d.entregado_at).toDateString() === hoy)
    .reduce((sum, d) => sum + Number(d.comision_motorizado ?? 0), 0)
)

onMounted(() => despachos.fetchHistorial())

// ── Logout ────────────────────────────────────────────────
const confirmLogout = reactive({ show: false })

async function handleLogout() {
  loggingOut.value = true
  await auth.logout()
  loggingOut.value = false
  confirmLogout.show = false
  router.push('/login')
}

// ── Modal detalle ─────────────────────────────────────────
const detalle = reactive({ show: false, item: null as DespachoItem | null })

function abrirDetalle(d: DespachoItem) {
  detalle.item = d
  detalle.show = true
}

// ── Helpers ───────────────────────────────────────────────
function esContraentrega(d: DespachoItem): boolean {
  return ['contraentrega_efectivo', 'contraentrega_yape']
    .includes(d.order?.metodo_pago ?? '')
}

function formatHora(d: string): string {
  return new Date(d).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function formatFecha(d: string): string {
  return new Date(d).toLocaleString('es-PE', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}
</script>