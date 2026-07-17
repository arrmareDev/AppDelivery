<template>
    <div class="min-h-screen flex items-center justify-center px-4 py-8" style="background: var(--color-bg)">
        <div class="w-full max-w-lg">

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

            <form @submit.prevent="handleRegister" class="card p-6 sm:p-8 flex flex-col gap-5">

                <!-- ══ DATOS PERSONALES ══ -->
                <div>
                    <p class="field-label mb-3" style="color: var(--color-brand-600)">Datos personales</p>

                    <div class="flex flex-col gap-3.5">
                        <div>
                            <label class="field-label">DNI *</label>
                            <input v-model="form.dni" required maxlength="15" placeholder="12345678"
                                class="field-input" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="field-label">Nombres *</label>
                                <input v-model="form.nombres" required placeholder="Juan Carlos" class="field-input" />
                            </div>
                            <div>
                                <label class="field-label">Apellidos *</label>
                                <input v-model="form.apellidos" required placeholder="Pérez Gómez"
                                    class="field-input" />
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Fecha de nacimiento *</label>
                            <input v-model="form.fecha_nacimiento" type="date" required :max="fechaMaximaNacimiento"
                                class="field-input" />
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="field-label">Teléfono *</label>
                                <input v-model="form.telefono" required placeholder="987 654 321" class="field-input" />
                            </div>
                            <div>
                                <label class="field-label">Correo *</label>
                                <input v-model="form.email" type="email" required placeholder="tu@correo.com"
                                    class="field-input" />
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Contraseña *</label>
                            <div class="relative">
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" required
                                    minlength="6" placeholder="Mínimo 6 caracteres" class="field-input pr-11" />
                                <button type="button" @click="showPassword = !showPassword" tabindex="-1"
                                    class="field-input-icon-btn">
                                    <EyeSlashIcon v-if="showPassword" class="w-[18px] h-[18px]" />
                                    <EyeIcon v-else class="w-[18px] h-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ══ DATOS DEL VEHÍCULO ══ -->
                <div class="pt-4 border-t" style="border-color: var(--color-line)">
                    <p class="field-label mb-3" style="color: var(--color-brand-600)">Datos del vehículo</p>

                    <div class="flex flex-col gap-3.5">
                        <div>
                            <label class="field-label">Placa *</label>
                            <input v-model="form.placa" required maxlength="10" placeholder="ABC-123"
                                class="field-input uppercase" @input="form.placa = form.placa.toUpperCase()" />
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label class="field-label">Marca *</label>
                                <input v-model="form.marca_vehiculo" required placeholder="Honda" class="field-input" />
                            </div>
                            <div>
                                <label class="field-label">Modelo *</label>
                                <input v-model="form.modelo_vehiculo" required placeholder="CB110"
                                    class="field-input" />
                            </div>
                            <div class="col-span-2 sm:col-span-1">
                                <label class="field-label">Año *</label>
                                <input v-model.number="form.anio_vehiculo" type="number" required min="1990"
                                    :max="anioMaximo" placeholder="2022" class="field-input" />
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Foto del vehículo *</label>
                            <div class="relative">
                                <input ref="fileInput" type="file" accept="image/*" required @change="onFotoChange"
                                    class="hidden" />
                                <button type="button" @click="fileInput?.click()" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed
                                           bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    style="border-color: #e5e7eb">
                                    <div v-if="fotoPreview" class="w-12 h-12 rounded-xl overflow-hidden shrink-0 border"
                                        style="border-color: var(--color-line)">
                                        <img :src="fotoPreview" class="w-full h-full object-cover" />
                                    </div>
                                    <div v-else
                                        class="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                        <CameraIcon class="w-5 h-5 text-gray-400" />
                                    </div>
                                    <span class="text-[13.5px] font-semibold text-left"
                                        style="color: var(--color-ink-soft)">
                                        {{ form.foto_vehiculo ? form.foto_vehiculo.name : 'Toca para subir una foto' }}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Número de SOAT <span class="normal-case font-medium"
                                    style="color: var(--color-ink-faint)">(opcional)</span></label>
                            <input v-model="form.soat_numero" placeholder="Si ya lo tienes" class="field-input" />
                        </div>
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
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
    UserPlusIcon, ExclamationTriangleIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon, CameraIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
    dni: '', nombres: '', apellidos: '', fecha_nacimiento: '',
    telefono: '', email: '', password: '',
    placa: '', marca_vehiculo: '', modelo_vehiculo: '', anio_vehiculo: null as number | null,
    foto_vehiculo: null as File | null,
    soat_numero: '',
})

const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const fotoPreview = ref('')

const anioMaximo = new Date().getFullYear() + 1

// Debe ser mayor de 18 años — fecha máxima seleccionable
const fechaMaximaNacimiento = computed(() => {
    const d = new Date()
    d.setFullYear(d.getFullYear() - 18)
    return d.toISOString().split('T')[0]
})

function onFotoChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    form.foto_vehiculo = file
    fotoPreview.value = URL.createObjectURL(file)
}

async function handleRegister() {
    errorMsg.value = ''
    successMsg.value = ''

    if (!form.foto_vehiculo) {
        errorMsg.value = 'Debes subir una foto del vehículo'
        return
    }
    if (!form.anio_vehiculo) {
        errorMsg.value = 'Ingresa el año del vehículo'
        return
    }

    loading.value = true
    const result = await auth.register({
        dni: form.dni,
        nombres: form.nombres,
        apellidos: form.apellidos,
        fecha_nacimiento: form.fecha_nacimiento,
        telefono: form.telefono,
        email: form.email,
        password: form.password,
        placa: form.placa,
        marca_vehiculo: form.marca_vehiculo,
        modelo_vehiculo: form.modelo_vehiculo,
        anio_vehiculo: form.anio_vehiculo,
        foto_vehiculo: form.foto_vehiculo,
        soat_numero: form.soat_numero || undefined,
    })
    loading.value = false

    if (result.ok) {
        successMsg.value = result.message
        setTimeout(() => router.push('/verificar-correo'), 1500)
    } else {
        errorMsg.value = result.message
    }
}
</script>