<template>
    <div class="app-shell">

        <!-- Header -->
        <header class="app-header">
            <div class="app-container flex items-center gap-3">
                <button @click="router.push('/')" class="back-btn">
                    <ArrowLeftIcon class="w-4 h-4" />
                </button>
                <div>
                    <h1 class="font-black text-lg sm:text-xl leading-tight" style="color: var(--color-ink)">Estadísticas
                    </h1>
                    <p class="text-xs" style="color: var(--color-ink-faint)">Tus ganancias en el tiempo</p>
                </div>
            </div>
        </header>

        <div class="app-container px-4 sm:px-6 lg:px-8 mt-4 pb-24 flex flex-col gap-4">

            <!-- ══ FILTRO DE PERIODO ══ -->
            <div class="flex gap-1 p-1 rounded-2xl bg-gray-100 self-start">
                <button v-for="opt in periodoOpciones" :key="opt.value" @click="periodo = opt.value"
                    class="px-4 py-1.5 rounded-xl text-[12.5px] font-bold border-none cursor-pointer transition-colors"
                    :class="periodo === opt.value ? 'bg-white shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'"
                    :style="periodo === opt.value ? 'color: var(--color-brand-600)' : ''">
                    {{ opt.label }}
                </button>
            </div>

            <!-- ══ SKELETON ══ -->
            <div v-if="loading" class="flex flex-col gap-4">
                <div class="grid grid-cols-2 gap-3">
                    <div class="h-24 rounded-3xl bg-gray-100 animate-pulse" />
                    <div class="h-24 rounded-3xl bg-gray-100 animate-pulse" />
                </div>
                <div class="h-40 rounded-3xl bg-gray-100 animate-pulse" />
            </div>

            <template v-else>
                <!-- ══ GANANCIA TOTAL ══ -->
                <div class="card p-5 sm:p-6" style="background: var(--color-brand-600)">
                    <p class="text-[10.5px] font-black uppercase tracking-widest mb-1 text-white/70">
                        {{ periodoLabel }}
                    </p>
                    <div class="flex items-baseline gap-1.5">
                        <span class="text-lg font-bold text-white/80">S/</span>
                        <span class="amount text-4xl sm:text-5xl leading-none text-white">
                            {{ stats.ganancia_total.toFixed(2) }}
                        </span>
                    </div>
                    <p class="text-[12.5px] text-white/70 mt-2 m-0">
                        {{ stats.total_entregas }} entrega{{ stats.total_entregas !== 1 ? 's' : '' }} completada{{
                            stats.total_entregas !== 1 ? 's' : '' }}
                    </p>
                </div>

                <!-- ══ PENDIENTE VS COBRADO ══ -->
                <div class="grid grid-cols-2 gap-3">
                    <div class="card p-4">
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1"
                            style="color: var(--color-ink-faint)">
                            Por cobrar
                        </p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-[13px] font-bold text-amber-500">S/</span>
                            <span class="amount text-xl leading-none text-amber-500">{{
                                stats.ganancia_pendiente.toFixed(2) }}</span>
                        </div>
                    </div>
                    <div class="card p-4">
                        <p class="text-[10px] font-black uppercase tracking-widest mb-1"
                            style="color: var(--color-ink-faint)">
                            Ya cobrado
                        </p>
                        <div class="flex items-baseline gap-1">
                            <span class="text-[13px] font-bold text-green-600">S/</span>
                            <span class="amount text-xl leading-none text-green-600">{{
                                stats.ganancia_cobrada.toFixed(2) }}</span>
                        </div>
                    </div>
                </div>

                <!-- ══ GRÁFICO DE BARRAS ══ -->
                <div class="card p-4 sm:p-5">
                    <p class="text-[10px] font-black uppercase tracking-widest mb-3"
                        style="color: var(--color-ink-faint)">
                        Desglose
                    </p>

                    <div v-if="stats.desglose.length === 0" class="py-8 text-center">
                        <p class="text-[13px] m-0" style="color: var(--color-ink-faint)">Sin ganancias en este periodo
                            todavía.</p>
                    </div>

                    <div v-else class="flex items-end gap-2 h-32">
                        <div v-for="d in stats.desglose" :key="d.clave"
                            class="flex-1 flex flex-col items-center gap-1.5 group relative">
                            <span v-if="d.monto > 0"
                                class="text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity"
                                style="color: var(--color-brand-600)">
                                {{ d.monto.toFixed(0) }}
                            </span>
                            <div class="w-full rounded-md transition-all duration-300" :style="{
                                height: `${Math.max(6, (d.monto / maxMonto) * 100)}%`,
                                background: d.monto > 0 ? 'var(--color-brand-500)' : '#eee'
                            }" />
                            <span class="text-[9px] font-bold uppercase truncate w-full text-center"
                                style="color: var(--color-ink-faint)">
                                {{ etiquetaClave(d.clave) }}
                            </span>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <AppNav active="estadisticas" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

        <!-- Modal logout -->
        <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
            message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
            confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import api from '../api/axios'
import { useAuthStore } from '../stores/auth'
import AppNav from '../components/AppNav.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const auth = useAuthStore()

interface EstadisticasResponse {
    periodo: string
    desde: string
    hasta: string
    ganancia_total: number
    ganancia_pendiente: number
    ganancia_cobrada: number
    total_entregas: number
    desglose: Array<{ clave: string; monto: number }>
}

const periodoOpciones = [
    { value: 'dia' as const, label: 'Hoy' },
    { value: 'semana' as const, label: 'Semana' },
    { value: 'mes' as const, label: 'Mes' },
    { value: 'anio' as const, label: 'Año' },
]

const periodo = ref<'dia' | 'semana' | 'mes' | 'anio'>('dia')
const loading = ref(true)
const stats = ref<EstadisticasResponse>({
    periodo: 'dia', desde: '', hasta: '',
    ganancia_total: 0, ganancia_pendiente: 0, ganancia_cobrada: 0,
    total_entregas: 0, desglose: [],
})

const periodoLabel = computed(() => ({
    dia: 'Ganancia de hoy',
    semana: 'Ganancia de la semana',
    mes: 'Ganancia del mes',
    anio: 'Ganancia del año',
}[periodo.value]))

const maxMonto = computed(() => Math.max(1, ...stats.value.desglose.map((d) => d.monto)))

function etiquetaClave(clave: string): string {
    if (periodo.value === 'dia') return `${clave}h`
    if (periodo.value === 'anio') {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        return meses[Number(clave) - 1] ?? clave
    }
    // día dentro de semana/mes — mostramos solo el día del mes
    const partes = clave.split('-')
    return partes[2] ?? clave
}

async function cargar() {
    loading.value = true
    try {
        const { data } = await api.get('/motorizado/estadisticas', { params: { periodo: periodo.value } })
        stats.value = data.data
    } catch {
        // se queda con los valores en cero — no bloquea la pantalla
    } finally {
        loading.value = false
    }
}

watch(periodo, cargar)
onMounted(cargar)

// ── Logout ────────────────────────────────────────────────
const confirmLogout = reactive({ show: false })
const loggingOut = ref(false)

async function handleLogout() {
    loggingOut.value = true
    await auth.logout()
    loggingOut.value = false
    confirmLogout.show = false
    router.push('/login')
}
</script>