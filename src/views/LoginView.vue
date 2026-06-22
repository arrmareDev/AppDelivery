<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div class="w-full max-w-sm sm:max-w-md">

            <!-- Logo / título -->
            <div class="text-center mb-8">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-red-600 flex items-center
                            justify-center mx-auto mb-4 shadow-lg shadow-red-600/30">
                    <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 16V4a1 1 0 011-1h6a1 1 0 011 1v12m4 0H4m12 0v4m-8-4v4" />
                    </svg>
                </div>
                <h1 class="font-black text-2xl sm:text-3xl text-gray-900 m-0">
                    Delivery Central
                </h1>
                <p class="text-sm text-gray-400 mt-1">Acceso para motorizados</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin"
                class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-4">

                <div>
                    <label class="block text-[11px] font-black uppercase tracking-widest
                                  text-gray-400 mb-1.5">
                        Correo electrónico
                    </label>
                    <input v-model="email" type="email" required placeholder="tu@correo.com" class="w-full px-4 py-3 rounded-2xl border-2 border-gray-100
                               bg-gray-50 text-[15px] text-gray-900 outline-none
                               focus:border-red-500 focus:bg-white
                               transition-all duration-200" />
                </div>

                <div>
                    <label class="block text-[11px] font-black uppercase tracking-widest
                                  text-gray-400 mb-1.5">
                        Contraseña
                    </label>
                    <input v-model="password" type="password" required placeholder="••••••••" class="w-full px-4 py-3 rounded-2xl border-2 border-gray-100
                               bg-gray-50 text-[15px] text-gray-900 outline-none
                               focus:border-red-500 focus:bg-white
                               transition-all duration-200" />
                </div>

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="errorMsg" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200
                               text-[13px] text-red-600 flex items-center gap-2">
                        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {{ errorMsg }}
                    </div>
                </Transition>

                <button type="submit" :disabled="loading" class="w-full py-3.5 rounded-2xl font-black text-[15px] text-white
                           border-none cursor-pointer transition-all duration-200
                           bg-red-600 shadow-lg shadow-red-600/30
                           hover:bg-red-700 active:scale-[0.98]
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 mt-1">
                    <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin" />
                    {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
                </button>
            </form>

            <p class="text-center text-sm text-gray-400 mt-6">
                ¿No tienes cuenta?
                <RouterLink to="/register" class="text-red-600 font-bold no-underline hover:underline">
                    Regístrate aquí
                </RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function handleLogin() {
    errorMsg.value = ''
    loading.value = true
    const ok = await auth.login(email.value, password.value)
    loading.value = false
    if (ok) {
        router.push('/')
    } else {
        errorMsg.value = 'Correo o contraseña incorrectos'
    }
}
</script>