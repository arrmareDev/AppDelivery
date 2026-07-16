<template>
    <div class="app-shell">

        <!-- Header -->
        <header class="app-header">
            <div class="max-w-4xl mx-auto flex items-center gap-3">
                <button @click="router.push('/')" class="back-btn">
                    <ArrowLeftIcon class="w-4 h-4" />
                </button>
                <div>
                    <h1 class="font-black text-lg sm:text-xl leading-tight" style="color: var(--color-ink)">Mi perfil
                    </h1>
                    <p class="text-xs" style="color: var(--color-ink-faint)">Actualiza tus datos personales</p>
                </div>
            </div>
        </header>

        <div class="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-24
                    lg:grid lg:grid-cols-[280px_1fr] lg:gap-6 lg:items-start">

            <!-- Avatar + resumen — columna fija en desktop -->
            <div
                class="card p-5 flex items-center gap-4 mb-4 lg:mb-0 lg:flex-col lg:items-start lg:text-left lg:sticky lg:top-24">
                <div class="w-16 h-16 rounded-2xl shrink-0 flex items-center
                            justify-center overflow-hidden border"
                    style="background: var(--color-brand-50); border-color: var(--color-brand-100)">
                    <span class="text-2xl font-black" style="color: var(--color-brand-500)">
                        {{ auth.user?.nombre?.charAt(0).toUpperCase() }}
                    </span>
                </div>
                <div class="flex-1 min-w-0 lg:w-full lg:mt-3">
                    <p class="font-black text-[17px] m-0 truncate" style="color: var(--color-ink)">{{ auth.user?.nombre
                        }}</p>
                    <p class="text-xs mt-0.5 truncate" style="color: var(--color-ink-faint)">{{ auth.user?.email }}</p>
                    <div class="flex items-center gap-1.5 mt-2">
                        <span v-if="auth.user?.verificado" class="badge bg-green-50 text-green-700 border-green-200">
                            <CheckBadgeIcon class="w-3 h-3" /> Verificado
                        </span>
                        <span v-else class="badge bg-amber-50 text-amber-700 border-amber-200">
                            <ClockIcon class="w-3 h-3" /> Pendiente
                        </span>
                    </div>
                </div>
            </div>

            <!-- Formularios — columna ancha -->
            <div class="flex flex-col gap-4 min-w-0">

                <!-- ══ DATOS PERSONALES ══ -->
                <form @submit.prevent="askGuardarDatos" class="card p-5 flex flex-col gap-3.5">
                    <h2 class="font-black text-[15px] m-0" style="color: var(--color-ink)">Datos personales</h2>

                    <div>
                        <label class="field-label">Nombre completo</label>
                        <input v-model="datosForm.nombre" required class="field-input" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label class="field-label">Teléfono</label>
                            <input v-model="datosForm.telefono" required class="field-input" />
                        </div>
                        <div>
                            <label class="field-label">Correo electrónico</label>
                            <input v-model="datosForm.email" type="email" required class="field-input" />
                        </div>
                    </div>

                    <Transition enter-active-class="transition-all duration-150"
                        enter-from-class="opacity-0 -translate-y-1" leave-to-class="opacity-0">
                        <div v-if="datosError" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-600
                                   flex items-center gap-2">
                            <ExclamationTriangleIcon class="w-4 h-4 shrink-0" /> {{ datosError }}
                        </div>
                    </Transition>

                    <button type="submit" :disabled="!datosCambiaron"
                        class="btn self-start px-5 py-2.5 text-[13.5px] text-white"
                        style="background: var(--color-brand-600)">
                        Guardar cambios
                    </button>
                </form>

                <!-- ══ CAMBIAR CONTRASEÑA ══ -->
                <form @submit.prevent="askCambiarPassword" class="card p-5 flex flex-col gap-3.5">
                    <h2 class="font-black text-[15px] m-0" style="color: var(--color-ink)">Cambiar contraseña</h2>

                    <div>
                        <label class="field-label">Contraseña actual</label>
                        <input v-model="passwordForm.actual" type="password" required placeholder="••••••••"
                            class="field-input" />
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label class="field-label">Nueva contraseña</label>
                            <input v-model="passwordForm.nueva" type="password" required minlength="6"
                                placeholder="Mínimo 6 caracteres" class="field-input" />
                        </div>
                        <div>
                            <label class="field-label">Confirmar contraseña</label>
                            <input v-model="passwordForm.confirmacion" type="password" required minlength="6"
                                placeholder="Repite la contraseña" class="field-input" />
                        </div>
                    </div>

                    <Transition enter-active-class="transition-all duration-150"
                        enter-from-class="opacity-0 -translate-y-1" leave-to-class="opacity-0">
                        <div v-if="passwordError" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-600
                                   flex items-center gap-2">
                            <ExclamationTriangleIcon class="w-4 h-4 shrink-0" /> {{ passwordError }}
                        </div>
                    </Transition>

                    <button type="submit"
                        :disabled="!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmacion"
                        class="btn self-start px-5 py-2.5 text-[13.5px] text-white bg-amber-500 hover:bg-amber-600">
                        Actualizar contraseña
                    </button>
                </form>
            </div>
        </div>

        <!-- ══ NAV ══ -->
        <AppNav active="perfil" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

        <!-- ══ MODALES DE CONFIRMACIÓN ══ -->
        <ConfirmModal v-model="confirmDatos.show" title="¿Guardar estos cambios?"
            message="Tus datos personales (nombre, teléfono y/o correo) se actualizarán en el sistema." variant="info"
            confirm-label="Sí, guardar cambios" :loading="guardandoDatos" @confirm="executeGuardarDatos" />

        <ConfirmModal v-model="confirmPassword.show" title="¿Cambiar tu contraseña?"
            message="Tu próxima vez que inicies sesión deberás usar la nueva contraseña." variant="warning"
            confirm-label="Sí, cambiar contraseña" :loading="cambiandoPassword" @confirm="executeCambiarPassword" />

        <ConfirmModal v-model="confirmLogout.show" title="¿Cerrar sesión?"
            message="Tendrás que volver a iniciar sesión para seguir recibiendo pedidos." variant="warning"
            confirm-label="Sí, cerrar sesión" :loading="loggingOut" @confirm="handleLogout" />
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
    ArrowLeftIcon,
    ClockIcon,
    ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { CheckBadgeIcon } from '@heroicons/vue/24/solid'
import { useAuthStore } from '../stores/auth'
import AppNav from '../components/AppNav.vue'
import ConfirmModal from '../components/ConfirmModal.vue'

const router = useRouter()
const auth = useAuthStore()

// ── Datos personales ──────────────────────────────────────
const datosForm = reactive({ nombre: '', telefono: '', email: '' })
const datosError = ref('')
const guardandoDatos = ref(false)
const confirmDatos = reactive({ show: false })

onMounted(() => {
    datosForm.nombre = auth.user?.nombre ?? ''
    datosForm.telefono = auth.user?.telefono ?? ''
    datosForm.email = auth.user?.email ?? ''
})

const datosCambiaron = computed(() =>
    datosForm.nombre !== auth.user?.nombre ||
    datosForm.telefono !== auth.user?.telefono ||
    datosForm.email !== auth.user?.email
)

function askGuardarDatos() {
    datosError.value = ''
    confirmDatos.show = true
}

async function executeGuardarDatos() {
    guardandoDatos.value = true
    const result = await auth.updatePerfil({
        nombre: datosForm.nombre,
        telefono: datosForm.telefono,
        email: datosForm.email,
    })
    guardandoDatos.value = false
    confirmDatos.show = false

    if (!result.ok) {
        datosError.value = result.message
    }
}

// ── Cambiar contraseña ────────────────────────────────────
const passwordForm = reactive({ actual: '', nueva: '', confirmacion: '' })
const passwordError = ref('')
const cambiandoPassword = ref(false)
const confirmPassword = reactive({ show: false })

function askCambiarPassword() {
    passwordError.value = ''
    if (passwordForm.nueva !== passwordForm.confirmacion) {
        passwordError.value = 'Las contraseñas no coinciden'
        return
    }
    confirmPassword.show = true
}

async function executeCambiarPassword() {
    cambiandoPassword.value = true
    const result = await auth.updatePerfil({
        password_actual: passwordForm.actual,
        password: passwordForm.nueva,
        password_confirmation: passwordForm.confirmacion,
    })
    cambiandoPassword.value = false
    confirmPassword.show = false

    if (result.ok) {
        passwordForm.actual = ''
        passwordForm.nueva = ''
        passwordForm.confirmacion = ''
    } else {
        passwordError.value = result.message
    }
}

// ── Logout ─────────────────────────────────────────────────
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