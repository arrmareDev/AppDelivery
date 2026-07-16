<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-sm sm:max-w-md">

            <!-- Logo / título -->
            <div class="text-center mb-8">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center
                            justify-center mx-auto mb-4"
                    style="background: var(--color-brand-600); box-shadow: 0 12px 28px -10px rgba(200,55,31,0.5)">
                    <TruckIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 class="font-black text-2xl sm:text-3xl m-0" style="color: var(--color-ink)">
                    Delivery Central
                </h1>
                <p class="text-sm mt-1" style="color: var(--color-ink-faint)">Acceso para motorizados</p>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="card p-6 sm:p-8 flex flex-col gap-4">

                <div>
                    <label class="field-label">Correo electrónico</label>
                    <input v-model="email" type="email" required placeholder="tu@correo.com" class="field-input" />
                </div>

                <div>
                    <div class="flex items-center justify-between mb-1.5">
                        <label class="field-label m-0">Contraseña</label>
                        <RouterLink to="/forgot-password" class="text-[11px] font-bold no-underline hover:underline"
                            style="color: var(--color-brand-600)">
                            ¿Olvidaste tu contraseña?
                        </RouterLink>
                    </div>

                    <!-- Wrapper relativo para poder posicionar el ojito adentro del input -->
                    <div class="relative">
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" required
                            placeholder="••••••••" class="field-input pr-11" />
                        <button type="button" @click="showPassword = !showPassword" tabindex="-1" class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg
                                   flex items-center justify-center border-none bg-transparent
                                   cursor-pointer transition-colors" style="color: var(--color-ink-faint)"
                            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                            <EyeSlashIcon v-if="showPassword" class="w-[18px] h-[18px]" />
                            <EyeIcon v-else class="w-[18px] h-[18px]" />
                        </button>
                    </div>
                </div>

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="errorMsg" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200
                               text-[13px] text-red-600 flex items-center gap-2">
                        <ExclamationTriangleIcon class="w-4 h-4 shrink-0" />
                        {{ errorMsg }}
                    </div>
                </Transition>

                <button type="submit" :disabled="loading" class="btn-primary mt-1">
                    <span v-if="loading" class="spinner" />
                    {{ loading ? 'Ingresando...' : 'Iniciar sesión' }}
                </button>
            </form>

            <p class="text-center text-sm mt-6" style="color: var(--color-ink-faint)">
                ¿No tienes cuenta?
                <RouterLink to="/register" class="font-bold no-underline hover:underline"
                    style="color: var(--color-brand-600)">
                    Regístrate aquí
                </RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { TruckIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
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