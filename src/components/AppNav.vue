<template>
    <!-- ══ SIDEBAR — escritorio (≥1024px) ══ -->
    <aside v-if="isDesktop" class="sidebar">
        <div class="px-5 pt-6 pb-5 flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                style="background: #0a0a0a">
                <img :src="logoUrl" alt="VoyYa" class="w-full h-full object-cover" />
            </div>
            <div class="min-w-0">
                <p class="font-black text-[14px] leading-tight m-0 truncate" style="color: var(--color-ink)">
                    VoyYa
                </p>
            </div>
        </div>

        <nav class="flex-1 px-3 flex flex-col gap-1 mt-2">
            <button @click="$emit('navigate', '/')" class="sidebar-link"
                :class="{ 'sidebar-link--active': active === 'home' }">
                <HomeIcon class="w-5 h-5 shrink-0" />
                Inicio
            </button>
            <button @click="$emit('navigate', '/historial')" class="sidebar-link"
                :class="{ 'sidebar-link--active': active === 'historial' }">
                <ClipboardDocumentListIcon class="w-5 h-5 shrink-0" />
                Historial
            </button>
            <button @click="$emit('navigate', '/estadisticas')" class="sidebar-link"
                :class="{ 'sidebar-link--active': active === 'estadisticas' }">
                <ChartBarIcon class="w-5 h-5 shrink-0" />
                Estadísticas
            </button>
            <button @click="$emit('navigate', '/perfil')" class="sidebar-link"
                :class="{ 'sidebar-link--active': active === 'perfil' }">
                <UserCircleIcon class="w-5 h-5 shrink-0" />
                Perfil
            </button>
        </nav>

        <div class="px-3 pb-5 pt-3 border-t flex flex-col gap-1" style="border-color: var(--color-line)">
            <div v-if="auth.user" class="flex items-center gap-2.5 px-3.5 py-2 mb-1">
                <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style="background: var(--color-brand-50)">
                    <span class="text-xs font-black" style="color: var(--color-brand-500)">
                        {{ auth.user.nombre?.charAt(0).toUpperCase() }}
                    </span>
                </div>
                <p class="text-[12.5px] font-bold truncate m-0" style="color: var(--color-ink)">
                    {{ auth.user.nombre }}
                </p>
            </div>
            <button @click="$emit('logout')" class="sidebar-link">
                <ArrowRightOnRectangleIcon class="w-5 h-5 shrink-0" />
                Salir
            </button>
        </div>
    </aside>

    <!-- ══ BARRA INFERIOR — mobile / tablet (<1024px) ══ -->
    <nav v-else class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t
                flex shrink-0 max-w-4xl mx-auto w-full
                pb-[env(safe-area-inset-bottom)]" style="border-color: var(--color-line)">
        <button @click="$emit('navigate', '/')" class="flex-1 flex flex-col items-center py-2.5 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors relative"
            :class="active === 'home' ? 'text-[color:var(--color-brand-600)]' : 'text-gray-400 hover:bg-gray-50 hover:text-[color:var(--color-brand-500)]'">
            <span v-if="active === 'home'"
                class="absolute top-0 w-8 h-0.5 rounded-full bg-[color:var(--color-brand-600)]" />
            <HomeIcon class="w-5 h-5" />
            <span class="text-[10px] font-bold">Inicio</span>
        </button>

        <button @click="$emit('navigate', '/historial')" class="flex-1 flex flex-col items-center py-2.5 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors relative"
            :class="active === 'historial' ? 'text-[color:var(--color-brand-600)]' : 'text-gray-400 hover:bg-gray-50 hover:text-[color:var(--color-brand-500)]'">
            <span v-if="active === 'historial'"
                class="absolute top-0 w-8 h-0.5 rounded-full bg-[color:var(--color-brand-600)]" />
            <ClipboardDocumentListIcon class="w-5 h-5" />
            <span class="text-[10px] font-bold">Historial</span>
        </button>

        <button @click="$emit('navigate', '/estadisticas')" class="flex-1 flex flex-col items-center py-2.5 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors relative"
            :class="active === 'estadisticas' ? 'text-[color:var(--color-brand-600)]' : 'text-gray-400 hover:bg-gray-50 hover:text-[color:var(--color-brand-500)]'">
            <span v-if="active === 'estadisticas'"
                class="absolute top-0 w-8 h-0.5 rounded-full bg-[color:var(--color-brand-600)]" />
            <ChartBarIcon class="w-5 h-5" />
            <span class="text-[10px] font-bold">Stats</span>
        </button>

        <button @click="$emit('navigate', '/perfil')" class="flex-1 flex flex-col items-center py-2.5 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors relative"
            :class="active === 'perfil' ? 'text-[color:var(--color-brand-600)]' : 'text-gray-400 hover:bg-gray-50 hover:text-[color:var(--color-brand-500)]'">
            <span v-if="active === 'perfil'"
                class="absolute top-0 w-8 h-0.5 rounded-full bg-[color:var(--color-brand-600)]" />
            <UserCircleIcon class="w-5 h-5" />
            <span class="text-[10px] font-bold">Perfil</span>
        </button>

        <button @click="$emit('logout')"
            class="flex-1 flex flex-col items-center py-2.5 gap-1 border-none bg-transparent
                   cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-[color:var(--color-brand-500)] transition-colors">
            <ArrowRightOnRectangleIcon class="w-5 h-5" />
            <span class="text-[10px] font-bold">Salir</span>
        </button>
    </nav>
</template>

<script setup lang="ts">
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    UserCircleIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useResponsive } from '../composables/useResponsive'
import logoUrl from '../assets/logo.png'

defineProps<{ active: 'home' | 'historial' | 'estadisticas' | 'perfil' | '' }>()
defineEmits<{ navigate: [path: string]; logout: [] }>()

const auth = useAuthStore()
const { isDesktop } = useResponsive()
</script>