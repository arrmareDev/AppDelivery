<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-sm sm:max-w-md">

            <div class="text-center mb-8">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center
                            justify-center mx-auto mb-4"
                    style="background: var(--color-brand-600); box-shadow: 0 12px 28px -10px rgba(200,55,31,0.5)">
                    <KeyIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 class="font-black text-2xl sm:text-3xl m-0" style="color: var(--color-ink)">
                    Recuperar contraseña
                </h1>
                <p class="text-sm mt-1" style="color: var(--color-ink-faint)">
                    Te enviaremos un enlace a tu correo
                </p>
            </div>

            <form v-if="!enviado" @submit.prevent="handleSubmit" class="card p-6 sm:p-8 flex flex-col gap-4">
                <div>
                    <label class="field-label">Correo electrónico</label>
                    <input v-model="email" type="email" required placeholder="tu@correo.com" class="field-input" />
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
                    {{ loading ? 'Enviando...' : 'Enviar enlace' }}
                </button>
            </form>

            <div v-else class="card p-6 sm:p-8 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                    <EnvelopeOpenIcon class="w-7 h-7 text-green-600" />
                </div>
                <p class="font-black text-[16px] m-0" style="color: var(--color-ink)">Revisa tu correo</p>
                <p class="text-[13.5px] leading-relaxed m-0" style="color: var(--color-ink-faint)">
                    Si <strong>{{ email }}</strong> está registrado, te llegará un enlace para crear una
                    contraseña nueva. Puede tardar unos minutos.
                </p>
            </div>

            <p class="text-center text-sm mt-6" style="color: var(--color-ink-faint)">
                <RouterLink to="/login" class="font-bold no-underline hover:underline"
                    style="color: var(--color-brand-600)">
                    ← Volver a iniciar sesión
                </RouterLink>
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { KeyIcon, ExclamationTriangleIcon, EnvelopeOpenIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const email = ref('')
const loading = ref(false)
const errorMsg = ref('')
const enviado = ref(false)

async function handleSubmit() {
    errorMsg.value = ''
    loading.value = true
    const result = await auth.requestPasswordReset(email.value)
    loading.value = false

    if (result.ok) {
        enviado.value = true
    } else {
        errorMsg.value = result.message
    }
}
</script>