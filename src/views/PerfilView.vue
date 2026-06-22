<template>
    <div class="min-h-screen flex flex-col bg-gray-50">

        <!-- Header -->
        <header class="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 shrink-0">
            <div class="max-w-2xl mx-auto flex items-center gap-3">
                <button @click="router.push('/')" class="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center
                           border-none cursor-pointer hover:bg-gray-200 transition-colors shrink-0">
                    ←
                </button>
                <div>
                    <h1 class="font-black text-lg sm:text-xl text-gray-900 leading-tight">Mi perfil</h1>
                    <p class="text-xs text-gray-400">Actualiza tus datos personales</p>
                </div>
            </div>
        </header>

        <div class="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 pb-24">
            <!-- Avatar + resumen -->
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 mb-4">
                <div class="w-16 h-16 rounded-2xl bg-gray-100 shrink-0 flex items-center
                            justify-center overflow-hidden border border-gray-200">
                    <span class="text-2xl font-black text-gray-400">
                        {{ auth.user?.nombre?.charAt(0).toUpperCase() }}
                    </span>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-black text-[17px] text-gray-900 m-0 truncate">{{ auth.user?.nombre }}</p>
                    <div class="flex items-center gap-1.5 mt-1">
                        <span v-if="auth.user?.verificado" class="text-[10px] font-bold px-2 py-0.5 rounded-full
                                   bg-green-50 text-green-700 border border-green-200">
                            ✓ Verificado
                        </span>
                        <span v-else class="text-[10px] font-bold px-2 py-0.5 rounded-full
                                   bg-amber-50 text-amber-700 border border-amber-200">
                            ⏳ Pendiente
                        </span>
                    </div>
                </div>
            </div>

            <!-- ══ DATOS PERSONALES ══ -->
            <form @submit.prevent="askGuardarDatos"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3.5 mb-4">
                <h2 class="font-black text-[15px] text-gray-900 m-0">Datos personales</h2>

                <div>
                    <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        Nombre completo
                    </label>
                    <input v-model="datosForm.nombre" required class="perfil-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Teléfono
                        </label>
                        <input v-model="datosForm.telefono" required class="perfil-input" />
                    </div>
                    <div>
                        <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Correo electrónico
                        </label>
                        <input v-model="datosForm.email" type="email" required class="perfil-input" />
                    </div>
                </div>

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="datosError" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-600
                               flex items-center gap-2">
                        ⚠️ {{ datosError }}
                    </div>
                </Transition>

                <button type="submit" :disabled="!datosCambiaron" class="self-start px-5 py-2.5 rounded-2xl font-bold text-[13.5px] text-white
                           bg-brand-primary, bg-red-600 border-none cursor-pointer
                           hover:bg-red-700 transition-all duration-150
                           disabled:opacity-40 disabled:cursor-not-allowed">
                    Guardar cambios
                </button>
            </form>

            <!-- ══ CAMBIAR CONTRASEÑA ══ -->
            <form @submit.prevent="askCambiarPassword"
                class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3.5">
                <h2 class="font-black text-[15px] text-gray-900 m-0">Cambiar contraseña</h2>

                <div>
                    <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                        Contraseña actual
                    </label>
                    <input v-model="passwordForm.actual" type="password" required placeholder="••••••••"
                        class="perfil-input" />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                        <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Nueva contraseña
                        </label>
                        <input v-model="passwordForm.nueva" type="password" required minlength="6"
                            placeholder="Mínimo 6 caracteres" class="perfil-input" />
                    </div>
                    <div>
                        <label class="block text-[10.5px] font-black uppercase tracking-widest text-gray-400 mb-1.5">
                            Confirmar contraseña
                        </label>
                        <input v-model="passwordForm.confirmacion" type="password" required minlength="6"
                            placeholder="Repite la contraseña" class="perfil-input" />
                    </div>
                </div>

                <Transition enter-active-class="transition-all duration-150" enter-from-class="opacity-0 -translate-y-1"
                    leave-to-class="opacity-0">
                    <div v-if="passwordError" class="px-3.5 py-3 rounded-2xl bg-red-50 border border-red-200 text-[13px] text-red-600
                               flex items-center gap-2">
                        ⚠️ {{ passwordError }}
                    </div>
                </Transition>

                <button type="submit"
                    :disabled="!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmacion" class="self-start px-5 py-2.5 rounded-2xl font-bold text-[13.5px] text-white
                           bg-amber-500 border-none cursor-pointer
                           hover:bg-amber-600 transition-all duration-150
                           disabled:opacity-40 disabled:cursor-not-allowed">
                    Actualizar contraseña
                </button>
            </form>
        </div>

        <!-- ══ NAV ══ -->
        <BottomNav active="perfil" @navigate="router.push($event)" @logout="confirmLogout.show = true" />

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
import { useAuthStore } from '../stores/auth'
import BottomNav from '../components/BottomNav.vue'
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

<style scoped>
.perfil-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    border: 2px solid #f3f4f6;
    background: #f9fafb;
    font-size: 14px;
    color: #111827;
    outline: none;
    transition: all 0.2s;
}

.perfil-input::placeholder {
    color: #d1d5db;
}

.perfil-input:focus {
    border-color: #dc2626;
    background: white;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.08);
}
</style>