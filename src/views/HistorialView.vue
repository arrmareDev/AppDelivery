<template>
  <div class="app-shell">

    <!-- Header -->
    <header class="app-header">
      <div class="app-container flex items-center gap-3">
        <button @click="router.push('/')" class="back-btn">
          <ArrowLeftIcon class="w-4 h-4" />
        </button>
        <div>
          <h1 class="font-black text-lg sm:text-xl leading-tight" style="color: var(--color-ink)">Historial</h1>
          <p class="text-xs" style="color: var(--color-ink-faint)">Tus entregas completadas</p>
        </div>
      </div>
    </header>

    <div class="app-container px-4 sm:px-6 lg:px-8 mt-4 flex flex-col gap-4">

      <!-- ══ MÉTRICAS ══ -->
      <div class="grid grid-cols-2 lg:grid-cols-[1fr_1fr_2fr] gap-3 sm:gap-4">
        <div class="card p-4 sm:p-5">
          <p class="text-[10px] font-black uppercase tracking-widest mb-1" style="color: var(--color-ink-faint)">
            Entregas hoy
          </p>
          <p class="amount text-2xl sm:text-3xl leading-none" style="color: var(--color-ink)">
            {{ entregasHoy }}
          </p>
        </div>
        <div class="card p-4 sm:p-5">
          <p class="text-[10px] font-black uppercase tracking-widest mb-1" style="color: var(--color-ink-faint)">
            Esta semana
          </p>
          <p class="amount text-2xl sm:text-3xl leading-none" style="color: var(--color-ink)">
            {{ entregasSemana }}
          </p>
        </div>

        <!-- Mini gráfico: entregas por día, últimos 7 días -->
        <div class="card p-4 sm:p-5 col-span-2 lg:col-span-1">
          <p class="text-[10px] font-black uppercase tracking-widest mb-2" style="color: var(--color-ink-faint)">
            Últimos 7 días
          </p>
          <div class="flex items-end gap-2 h-14">
            <div v-for="d in chartData" :key="d.dateKey" class="flex-1 flex flex-col items-center gap-1">
              <div class="w-full rounded-md transition-all duration-300" :style="{
                height: `${Math.max(6, (d.count / maxChartCount) * 100)}%`,
                background: d.count > 0 ? 'var(--color-brand-500)' : '#eee'
              }" />
              <span class="text-[9px] font-bold uppercase" style="color: var(--color-ink-faint)">{{ d.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ FILTROS ══ -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex gap-1 p-1 rounded-2xl bg-gray-100">
          <button v-for="opt in rangoOpciones" :key="opt.value" @click="rango = opt.value"
            class="px-3 py-1.5 rounded-xl text-[12px] font-bold border-none cursor-pointer transition-colors"
            :class="rango === opt.value ? 'bg-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'"
            :style="rango === opt.value ? 'color: var(--color-brand-600)' : ''">
            {{ opt.label }}
          </button>
        </div>

        <select v-model="metodoFiltro" class="field-input w-auto py-2 text-[12.5px] font-semibold">
          <option value="todos">Todos los métodos</option>
          <option value="contraentrega_efectivo">Efectivo</option>
          <option value="contraentrega_yape">Yape/Plin</option>
          <option value="anticipado">Pago anticipado</option>
        </select>

        <select v-if="negociosDisponibles.length > 1" v-model="negocioFiltro"
          class="field-input w-auto py-2 text-[12.5px] font-semibold">
          <option value="todos">Todos los negocios</option>
          <option v-for="r in negociosDisponibles" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>
    </div>

    <!-- Lista -->
    <div class="flex-1 app-container px-4 sm:px-6 lg:px-8 py-4 pb-24">

      <div v-if="despachos.loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div v-for="n in 4" :key="n" class="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      </div>

      <div v-else-if="historialFiltrado.length === 0" class="empty-state">
        <div class="empty-state-icon">
          <ArchiveBoxIcon class="w-8 h-8 text-gray-300" />
        </div>
        <p class="font-bold text-sm" style="color: var(--color-ink-soft)">
          {{ despachos.historial.length === 0 ? 'Sin entregas todavía' : 'Nada coincide con estos filtros' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        <div v-for="d in historialFiltrado" :key="d.id" class="card-interactive p-4 flex flex-col gap-2.5"
          @click="abrirDetalle(d)">
          <div class="flex items-center gap-3">
            <div class="icon-tile bg-green-50 border border-green-200">
              <CheckCircleIcon class="w-5 h-5 text-green-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="order-code text-[11px] text-gray-500">
                  #{{ d.order_id }}
                </span>
                <span class="font-bold text-[13px] truncate" style="color: var(--color-ink)">
                  {{ d.order?.client_name }}
                </span>
                <span v-if="d.negocio" class="badge bg-purple-50 text-purple-700 border-purple-200">
                  {{ d.negocio }}
                </span>
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <p class="text-[12px] m-0" style="color: var(--color-ink-faint)">
                  {{ d.entregado_at ? formatFecha(d.entregado_at) : '' }}
                </p>
                <span v-if="d.order?.metodo_pago && esContraentrega(d)"
                  class="badge bg-amber-50 text-amber-700 border-amber-200">
                  <component :is="d.order.metodo_pago === 'contraentrega_yape' ? DevicePhoneMobileIcon : BanknotesIcon"
                    class="w-3 h-3" />
                  {{ d.order.metodo_pago === 'contraentrega_yape' ? 'Yape' : 'Efectivo' }}
                </span>
              </div>
            </div>
            <div class="flex flex-col items-end gap-0.5 shrink-0">
              <div class="flex items-baseline gap-0.5">
                <span class="text-[10px] text-gray-400">S/</span>
                <span class="amount text-base leading-none" style="color: var(--color-brand-600)">
                  {{ Number(d.order?.total ?? 0).toFixed(2) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Productos con precio -->
          <div v-if="d.order?.items?.length" class="flex flex-wrap gap-1.5 pl-[52px]">
            <span v-for="item in d.order.items.slice(0, 3)" :key="item.name"
              class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {{ item.qty }}x {{ item.name }}
              <template v-if="precioSubtotal(item) !== null"> · S/{{ precioSubtotal(item)!.toFixed(2) }}</template>
            </span>
            <span v-if="d.order.items.length > 3"
              class="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
              +{{ d.order.items.length - 3 }} más
            </span>
          </div>
        </div>
      </div>

      <!-- Cargar más -->
      <div v-if="despachos.hayMasHistorial" class="flex justify-center mt-4">
        <button @click="despachos.loadMoreHistorial()" :disabled="despachos.loadingMore" class="px-5 py-2.5 rounded-2xl border-2 border-gray-200 bg-white text-gray-600
                 font-bold text-[13px] cursor-pointer disabled:opacity-60
                 hover:border-gray-300 transition-all duration-150 flex items-center gap-2">
          <span v-if="despachos.loadingMore"
            class="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          {{ despachos.loadingMore ? 'Cargando...' : 'Cargar más' }}
        </button>
      </div>
    </div>

    <!-- Nav -->
    <AppNav active="historial" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

    <!-- Modal logout -->
    <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
      message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
      confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />

    <!-- ══ MODAL DETALLE DEL DESPACHO — sin cifras de dinero ══ -->
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
                      <span class="order-code text-[11px] text-gray-500">
                        #{{ detalle.item.order_id }}
                      </span>
                      <span v-if="detalle.item.negocio" class="badge bg-purple-50 text-purple-700 border-purple-200">
                        {{ detalle.item.negocio }}
                      </span>
                    </div>
                    <h3 class="font-black text-[18px] m-0" style="color: var(--color-ink)">
                      {{ detalle.item.order?.client_name }}
                    </h3>
                    <p class="text-xs m-0 mt-0.5" style="color: var(--color-ink-faint)">
                      Entregado {{ detalle.item.entregado_at
                        ? formatFecha(detalle.item.entregado_at) : '' }}
                    </p>
                  </div>
                  <button @click="detalle.show = false" class="w-8 h-8 rounded-full bg-gray-100 flex items-center
                                               justify-center border-none cursor-pointer
                                               hover:bg-gray-200 transition-colors shrink-0">
                    <XMarkIcon class="w-4 h-4" />
                  </button>
                </div>

                <!-- Dirección -->
                <div class="flex items-start gap-2.5 mb-4">
                  <div class="icon-tile bg-blue-50 mt-0.5">
                    <MapPinIcon class="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-[10.5px] font-medium m-0" style="color: var(--color-ink-faint)">
                      Dirección entregada
                    </p>
                    <p class="font-semibold text-[13px] m-0" style="color: var(--color-ink)">
                      {{ detalle.item.order?.address }}
                    </p>
                    <p v-if="detalle.item.order?.reference"
                      class="text-[11.5px] text-amber-700 font-medium m-0 mt-0.5 flex items-center gap-1">
                      <MapPinIcon class="w-3 h-3 shrink-0" /> {{ detalle.item.order.reference }}
                    </p>
                  </div>
                </div>

                <!-- Método de pago -->
                <div v-if="detalle.item.order?.metodo_pago" class="flex items-start gap-2.5 mb-4">
                  <div class="icon-tile bg-amber-50 mt-0.5">
                    <component :is="detalle.item.order.metodo_pago === 'contraentrega_yape' ? DevicePhoneMobileIcon
                      : detalle.item.order.metodo_pago === 'contraentrega_efectivo' ? BanknotesIcon : CreditCardIcon"
                      class="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p class="text-[10.5px] font-medium m-0" style="color: var(--color-ink-faint)">
                      Método de pago
                    </p>
                    <p class="font-semibold text-[13px] m-0" style="color: var(--color-ink)">
                      {{ metodoPagoLabel(detalle.item.order.metodo_pago) }}
                    </p>
                  </div>
                </div>

                <!-- Productos -->
                <div class="bg-gray-50 rounded-2xl overflow-hidden mb-4">
                  <div class="px-4 py-2.5 border-b border-gray-100">
                    <p class="text-[10.5px] font-black uppercase tracking-wider m-0"
                      style="color: var(--color-ink-faint)">
                      Productos
                    </p>
                  </div>
                  <div class="divide-y divide-gray-100">
                    <div v-for="item in detalle.item.order?.items" :key="item.name"
                      class="flex items-start justify-between px-4 py-3 gap-3">
                      <div class="flex-1 min-w-0">
                        <p class="text-[13px] font-semibold m-0" style="color: var(--color-ink)">
                          {{ item.name }}
                        </p>
                        <p v-if="item.custom_summary" class="text-[11px] m-0 mt-0.5 leading-relaxed"
                          style="color: var(--color-ink-faint)">
                          {{ item.custom_summary }}
                        </p>
                        <p v-if="precioUnitario(item) !== null" class="text-[11px] m-0 mt-0.5"
                          style="color: var(--color-ink-faint)">
                          S/ {{ precioUnitario(item)!.toFixed(2) }} c/u
                        </p>
                      </div>
                      <div class="flex flex-col items-end gap-0.5 shrink-0">
                        <span class="order-code text-xs text-gray-500
                                     bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                          x{{ item.qty }}
                        </span>
                        <span v-if="precioSubtotal(item) !== null" class="amount text-[12px]"
                          style="color: var(--color-ink-soft)">
                          S/ {{ precioSubtotal(item)!.toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Totales -->
                <div class="bg-gray-50 rounded-2xl p-4 flex flex-col gap-2 mb-4">
                  <div v-if="detalle.item.order?.subtotal" class="flex justify-between text-[12.5px]">
                    <span class="text-gray-500">Subtotal productos</span>
                    <span class="amount" style="color: var(--color-ink-soft)">
                      S/ {{ Number(detalle.item.order.subtotal).toFixed(2) }}
                    </span>
                  </div>
                  <div v-if="detalle.item.order?.delivery_fee" class="flex justify-between text-[12.5px]">
                    <span class="text-gray-500">Costo de delivery</span>
                    <span class="amount text-blue-600">
                      S/ {{ Number(detalle.item.order.delivery_fee).toFixed(2) }}
                    </span>
                  </div>
                  <div class="flex justify-between pt-2 border-t border-gray-200">
                    <span class="font-bold text-[13px]" style="color: var(--color-ink-soft)">Total</span>
                    <div class="flex items-baseline gap-0.5">
                      <span class="text-[11px] text-gray-400">S/</span>
                      <span class="amount text-[18px] leading-none" style="color: var(--color-brand-600)">
                        {{ Number(detalle.item.order?.total ?? 0).toFixed(2) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Monto cobrado (si fue contraentrega) -->
                <div v-if="detalle.item.monto_cobrado" class="bg-green-50 rounded-2xl p-4 flex items-center
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
                    <span class="amount text-[22px] text-green-700 leading-none">
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
import {
  ArrowLeftIcon,
  ArchiveBoxIcon,
  XMarkIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '../stores/auth'
import { useDespachosStore } from '../stores/despacho'
import AppNav from '../components/AppNav.vue'
import ConfirmModal from '../components/ConfirmModal.vue'
import type { DespachoItem } from '../stores/despacho'

const router = useRouter()
const auth = useAuthStore()
const despachos = useDespachosStore()
const loggingOut = ref(false)

onMounted(() => despachos.fetchHistorial())

// ── Métricas (solo conteos, sin cifras de dinero) ─────────
const hoy = new Date().toDateString()

const entregasHoy = computed(() =>
  despachos.historial.filter(d =>
    d.entregado_at && new Date(d.entregado_at).toDateString() === hoy
  ).length
)

const inicioSemana = (() => {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
})()

const entregasSemana = computed(() =>
  despachos.historial.filter(d =>
    d.entregado_at && new Date(d.entregado_at) >= inicioSemana
  ).length
)

// Mini gráfico: entregas por día, últimos 7 días
const chartData = computed(() => {
  const dias = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toDateString()
    const count = despachos.historial.filter(x =>
      x.entregado_at && new Date(x.entregado_at).toDateString() === dateKey
    ).length
    dias.push({ dateKey, count, label: d.toLocaleDateString('es-PE', { weekday: 'short' }).replace('.', '') })
  }
  return dias
})

const maxChartCount = computed(() => Math.max(1, ...chartData.value.map(d => d.count)))

// ── Filtros ────────────────────────────────────────────────
const rangoOpciones = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'semana', label: 'Semana' },
  { value: 'mes', label: 'Mes' },
  { value: 'todo', label: 'Todo' },
] as const

const rango = ref<'hoy' | 'semana' | 'mes' | 'todo'>('todo')
const metodoFiltro = ref('todos')
const negocioFiltro = ref('todos')

const negociosDisponibles = computed(() => {
  const set = new Set<string>()
  despachos.historial.forEach(d => { if (d.negocio) set.add(d.negocio) })
  return Array.from(set)
})

const historialFiltrado = computed(() => {
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)

  return despachos.historial.filter(d => {
    if (!d.entregado_at) return false
    const fecha = new Date(d.entregado_at)

    if (rango.value === 'hoy' && fecha.toDateString() !== hoy) return false
    if (rango.value === 'semana' && fecha < inicioSemana) return false
    if (rango.value === 'mes' && fecha < inicioMes) return false

    if (metodoFiltro.value !== 'todos' && d.order?.metodo_pago !== metodoFiltro.value) return false
    if (negocioFiltro.value !== 'todos' && d.negocio !== negocioFiltro.value) return false

    return true
  })
})

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

function metodoPagoLabel(m: string): string {
  const map: Record<string, string> = {
    anticipado: 'Pago anticipado',
    contraentrega_efectivo: 'Cobrado en efectivo',
    contraentrega_yape: 'Cobrado por Yape/Plin',
  }
  return map[m] ?? m
}

function formatFecha(d: string): string {
  return new Date(d).toLocaleString('es-PE', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

// Precio por unidad — se deriva de subtotal/qty si el backend no manda
// unit_price directamente, para que el precio siempre se muestre
// mientras exista al menos uno de los dos campos.
type ItemPedido = NonNullable<NonNullable<DespachoItem['order']>['items']>[number]

function precioUnitario(item: ItemPedido): number | null {
  if (item.unit_price != null) return Number(item.unit_price)
  if (item.subtotal != null && item.qty) return Number(item.subtotal) / item.qty
  return null
}

function precioSubtotal(item: ItemPedido): number | null {
  if (item.subtotal != null) return Number(item.subtotal)
  if (item.unit_price != null) return Number(item.unit_price) * item.qty
  return null
}
</script>