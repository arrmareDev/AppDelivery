<template>
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100
                flex shrink-0 max-w-4xl mx-auto w-full
                pb-[env(safe-area-inset-bottom)]">
        <button @click="$emit('navigate', '/')" class="flex-1 flex flex-col items-center py-3 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors"
            :class="active === 'home' ? 'text-red-600' : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span class="text-[10px] font-bold">Inicio</span>
        </button>

        <button @click="$emit('navigate', '/historial')" class="flex-1 flex flex-col items-center py-3 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors"
            :class="active === 'historial' ? 'text-red-600' : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span class="text-[10px] font-bold">Historial</span>
        </button>

        <button @click="$emit('navigate', '/perfil')" class="flex-1 flex flex-col items-center py-3 gap-1 border-none bg-transparent
                   cursor-pointer transition-colors"
            :class="active === 'perfil' ? 'text-red-600' : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span class="text-[10px] font-bold">Perfil</span>
        </button>

        <button @click="$emit('logout')" class="flex-1 flex flex-col items-center py-3 gap-1 border-none bg-transparent
                   cursor-pointer text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span class="text-[10px] font-bold">Salir</span>
        </button>
    </nav>
</template>

<script setup lang="ts">
defineProps<{ active: 'home' | 'historial' | 'perfil' | '' }>()
defineEmits<{ navigate: [path: string]; logout: [] }>()
</script>