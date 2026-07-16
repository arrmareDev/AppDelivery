<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-sm sm:max-w-md">

            <div class="text-center mb-6">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center
                            justify-center mx-auto mb-3"
                    style="background: var(--color-brand-600); box-shadow: 0 12px 28px -10px rgba(200,55,31,0.5)">
                    <UserPlusIcon class="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </div>
                <h1 class="font-black text-2xl sm:text-3xl m-0" style="color: var(--color-ink)">
                    Crear cuenta
                </h1>
                <p class="text-sm mt-1" style="color: var(--color-ink-faint)">Únete como motorizado</p>
            </div>

            <form @submit.prevent="handleRegister" class="card p-6 sm:p-8 flex flex-col gap-3.5">

                <div>
                    <label class="field-label">Nombre completo</label>
                    <input v-model="form.nombre" required placeholder="Juan Pérez" class="field-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label class="field-label">Teléfono</label>
                        <input v-model="form.telefono" required placeholder="987 654 321" class="field-input" />
                    </div>
                    <div>
                        <label class="field-label">Correo</label>
                        <input v-model="form.email" type="email" required placeholder="tu@correo.com"
                            class="field-input" />
                    </div>
                </div>

                <div>
                    <label class="field-label">Contraseña</label>
                    <div class="relative">
                        <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required minlength="6"
                            placeholder="Mínimo 6 caracteres" class="field-input pr-11" />
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

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="successMsg" class="px-3.5 py-3 rounded-2xl bg-green-50 border border-green-200
                               text-[13px] text-green-700 flex items-center gap-2">
                        <CheckCircleIcon class="w-4 h-4 shrink-0" />
                        {{ successMsg }}
                    </div>
                </Transition>

                <button type="submit" :disabled="loading" class="btn-primary mt-1">
                    <span v-if="loading" class="spinner" />
                    {{ loading ? 'Creando cuenta...' : 'Registrarme' }}
                </button>
            </form>

            <p class="text-center text-sm mt-6" style="color: var(--color-ink-faint)">
                ¿Ya tienes cuenta?
                <RouterLink to="/login" class="font-bold no-underline hover:underline"
                    style="color: var(--color-brand-600)">
                    Inicia sesión
                </RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    UserPlusIcon, ExclamationTriangleIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
    nombre: '', telefono: '', email: '', password: '',
})

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

async function handleRegister() {
    errorMsg.value = ''
    successMsg.value = ''
    loading.value = true
    const result = await auth.register(form)
    loading.value = false

    if (result.ok) {
        successMsg.value = result.message
        setTimeout(() => router.push('/verificar-correo'), 1500)
    } else {
        errorMsg.value = result.message
    }
}
</script>