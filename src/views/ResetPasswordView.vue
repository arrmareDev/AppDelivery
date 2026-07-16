<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-sm sm:max-w-md">

            <div class="text-center mb-8">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center
                            justify-center mx-auto mb-4"
                    style="background: var(--color-brand-600); box-shadow: 0 12px 28px -10px rgba(200,55,31,0.5)">
                    <LockClosedIcon class="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <h1 class="font-black text-2xl sm:text-3xl m-0" style="color: var(--color-ink)">
                    Nueva contraseña
                </h1>
                <p class="text-sm mt-1" style="color: var(--color-ink-faint)">Crea una contraseña nueva para tu cuenta
                </p>
            </div>

            <div v-if="!tokenValido" class="card p-6 sm:p-8 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                    <ExclamationTriangleIcon class="w-7 h-7 text-red-600" />
                </div>
                <p class="font-black text-[16px] m-0" style="color: var(--color-ink)">Enlace inválido</p>
                <p class="text-[13.5px] leading-relaxed m-0" style="color: var(--color-ink-faint)">
                    Falta información en el enlace. Solicita uno nuevo desde la pantalla anterior.
                </p>
                <RouterLink to="/forgot-password" class="btn-primary mt-2 no-underline">
                    Solicitar nuevo enlace
                </RouterLink>
            </div>

            <form v-else-if="!listo" @submit.prevent="handleSubmit" class="card p-6 sm:p-8 flex flex-col gap-4">
                <div>
                    <label class="field-label">Nueva contraseña</label>
                    <div class="relative">
                        <input v-model="password" :type="showPassword ? 'text' : 'password'" required minlength="6"
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

                <div>
                    <label class="field-label">Confirmar contraseña</label>
                    <div class="relative">
                        <input v-model="passwordConfirmation" :type="showPasswordConfirm ? 'text' : 'password'" required
                            minlength="6" placeholder="Repite la contraseña" class="field-input pr-11" />
                        <button type="button" @click="showPasswordConfirm = !showPasswordConfirm" tabindex="-1" class="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg
                                   flex items-center justify-center border-none bg-transparent
                                   cursor-pointer transition-colors" style="color: var(--color-ink-faint)"
                            :aria-label="showPasswordConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'">
                            <EyeSlashIcon v-if="showPasswordConfirm" class="w-[18px] h-[18px]" />
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
                    {{ loading ? 'Guardando...' : 'Guardar contraseña' }}
                </button>
            </form>

            <div v-else class="card p-6 sm:p-8 flex flex-col items-center text-center gap-3">
                <div class="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                    <CheckCircleIcon class="w-7 h-7 text-green-600" />
                </div>
                <p class="font-black text-[16px] m-0" style="color: var(--color-ink)">¡Listo!</p>
                <p class="text-[13.5px] leading-relaxed m-0" style="color: var(--color-ink-faint)">
                    Tu contraseña se actualizó correctamente.
                </p>
                <RouterLink to="/login" class="btn-primary mt-2 no-underline">
                    Iniciar sesión
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
    LockClosedIcon, ExclamationTriangleIcon, EyeIcon, EyeSlashIcon,
} from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()

const token = computed(() => String(route.query.token ?? ''))
const email = computed(() => String(route.query.email ?? ''))
const tokenValido = computed(() => !!token.value && !!email.value)

const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const listo = ref(false)

async function handleSubmit() {
    errorMsg.value = ''

    if (password.value !== passwordConfirmation.value) {
        errorMsg.value = 'Las contraseñas no coinciden'
        return
    }

    loading.value = true
    const result = await auth.resetPassword({
        token: token.value,
        email: email.value,
        password: password.value,
        password_confirmation: passwordConfirmation.value,
    })
    loading.value = false

    if (result.ok) {
        listo.value = true
    } else {
        errorMsg.value = result.message
    }
}
</script>