<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
        <div class="w-full max-w-sm sm:max-w-md">

            <div class="text-center mb-6">
                <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-red-600 flex items-center
                            justify-center mx-auto mb-3 shadow-lg shadow-red-600/30">
                    <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h1 class="font-black text-2xl sm:text-3xl text-gray-900 m-0">
                    Crear cuenta
                </h1>
                <p class="text-sm text-gray-400 mt-1">Únete como motorizado</p>
            </div>

            <form @submit.prevent="handleRegister"
                class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col gap-3.5">

                <div>
                    <label class="block text-[11px] font-black uppercase tracking-widest
                                  text-gray-400 mb-1.5">
                        Nombre completo
                    </label>
                    <input v-model="form.nombre" required placeholder="Juan Pérez" class="reg-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label class="block text-[11px] font-black uppercase tracking-widest
                                      text-gray-400 mb-1.5">
                            Teléfono
                        </label>
                        <input v-model="form.telefono" required placeholder="987 654 321" class="reg-input" />
                    </div>
                    <div>
                        <label class="block text-[11px] font-black uppercase tracking-widest
                                      text-gray-400 mb-1.5">
                            Correo
                        </label>
                        <input v-model="form.email" type="email" required placeholder="tu@correo.com"
                            class="reg-input" />
                    </div>
                </div>

                <div>
                    <label class="block text-[11px] font-black uppercase tracking-widest
                                  text-gray-400 mb-1.5">
                        Contraseña
                    </label>
                    <input v-model="form.password" type="password" required minlength="6"
                        placeholder="Mínimo 6 caracteres" class="reg-input" />
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

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="successMsg" class="px-3.5 py-3 rounded-2xl bg-green-50 border border-green-200
                               text-[13px] text-green-700 flex items-center gap-2">
                        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {{ successMsg }}
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
                    {{ loading ? 'Creando cuenta...' : 'Registrarme' }}
                </button>
            </form>

            <p class="text-center text-sm text-gray-400 mt-6">
                ¿Ya tienes cuenta?
                <RouterLink to="/login" class="text-red-600 font-bold no-underline hover:underline">
                    Inicia sesión
                </RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
    nombre: '', telefono: '', email: '', password: '',
})

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
        setTimeout(() => router.push('/'), 1500)
    } else {
        errorMsg.value = result.message
    }
}
</script>

<style scoped>
.reg-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 2px solid #f3f4f6;
    background: #f9fafb;
    font-size: 15px;
    color: #111827;
    outline: none;
    transition: all 0.2s;
}

.reg-input::placeholder {
    color: #d1d5db;
}

.reg-input:focus {
    border-color: #dc2626;
    background: white;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}
</style>