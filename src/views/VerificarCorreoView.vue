<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-sm sm:max-w-md text-center">

            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center
                        justify-center mx-auto mb-4" style="background: var(--color-brand-50)">
                <EnvelopeOpenIcon class="w-8 h-8 sm:w-10 sm:h-10" style="color: var(--color-brand-500)" />
            </div>

            <h1 class="font-black text-2xl sm:text-3xl m-0" style="color: var(--color-ink)">
                Confirma tu correo
            </h1>
            <p class="text-sm mt-2 leading-relaxed" style="color: var(--color-ink-faint)">
                Te enviamos un enlace de confirmación a
                <strong style="color: var(--color-ink)">{{ auth.user?.email }}</strong>.
                Ábrelo para poder recibir pedidos.
            </p>

            <div class="card p-6 mt-6 flex flex-col items-center gap-3">
                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="mensaje" class="w-full px-3.5 py-3 rounded-2xl text-[13px] flex items-center gap-2"
                        :class="ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'">
                        <component :is="ok ? CheckCircleIcon : ExclamationTriangleIcon" class="w-4 h-4 shrink-0" />
                        {{ mensaje }}
                    </div>
                </Transition>

                <button @click="handleResend" :disabled="loading || cooldown > 0" class="btn-primary">
                    <span v-if="loading" class="spinner" />
                    {{ cooldown > 0 ? `Reenviar en ${cooldown}s` : loading ? 'Enviando...' : 'Reenviar correo' }}
                </button>

                <button @click="handleLogout" :disabled="loggingOut" class="btn-outline w-full">
                    <span v-if="loggingOut" class="spinner" />
                    {{ loggingOut ? 'Cerrando...' : 'Usar otra cuenta' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { EnvelopeOpenIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const loggingOut = ref(false)
const mensaje = ref('')
const ok = ref(false)
const cooldown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

function startCooldown() {
    cooldown.value = 30
    timer = setInterval(() => {
        cooldown.value -= 1
        if (cooldown.value <= 0 && timer) {
            clearInterval(timer)
            timer = null
        }
    }, 1_000)
}

async function handleResend() {
    loading.value = true
    mensaje.value = ''
    const result = await auth.resendVerification()
    loading.value = false
    ok.value = result.ok
    mensaje.value = result.message
    if (result.ok) startCooldown()
}

async function handleLogout() {
    loggingOut.value = true
    await auth.logout()
    loggingOut.value = false
    router.push('/login')
}

onUnmounted(() => {
    if (timer) clearInterval(timer)
})
</script>