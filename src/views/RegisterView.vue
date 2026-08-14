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

            <form @submit.prevent="handleRegister" class="card p-6 sm:p-8 flex flex-col gap-5" novalidate>

                <!-- ══ DATOS PERSONALES ══ -->
                <div>
                    <p class="field-label mb-3" style="color: var(--color-brand-600)">Datos personales</p>

                    <div class="flex flex-col gap-3.5">
                        <div>
                            <label class="field-label">DNI *</label>
                            <input :value="form.dni" @input="onDniInput" inputmode="numeric" maxlength="8"
                                placeholder="12345678" class="field-input" :class="errClass('dni')" />
                            <p v-if="fieldErrors.dni" class="field-error">{{ fieldErrors.dni }}</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="field-label">Nombres *</label>
                                <input v-model="form.nombres" placeholder="Juan Carlos" class="field-input"
                                    :class="errClass('nombres')" />
                                <p v-if="fieldErrors.nombres" class="field-error">{{ fieldErrors.nombres }}</p>
                            </div>
                            <div>
                                <label class="field-label">Apellidos *</label>
                                <input v-model="form.apellidos" placeholder="Pérez Gómez" class="field-input"
                                    :class="errClass('apellidos')" />
                                <p v-if="fieldErrors.apellidos" class="field-error">{{ fieldErrors.apellidos }}</p>
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Fecha de nacimiento *</label>
                            <input v-model="form.fecha_nacimiento" type="date" :max="fechaMaximaNacimiento"
                                class="field-input" :class="errClass('fecha_nacimiento')" />
                            <p v-if="fieldErrors.fecha_nacimiento" class="field-error">{{ fieldErrors.fecha_nacimiento
                                }}</p>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label class="field-label">Teléfono *</label>
                                <input :value="form.telefono" @input="onTelefonoInput" type="tel" inputmode="numeric"
                                    maxlength="9" placeholder="987654321" class="field-input"
                                    :class="errClass('telefono')" />
                                <p v-if="fieldErrors.telefono" class="field-error">{{ fieldErrors.telefono }}</p>
                            </div>
                            <div>
                                <label class="field-label">Correo *</label>
                                <input v-model="form.email" type="email" placeholder="tu@correo.com" class="field-input"
                                    :class="errClass('email')" />
                                <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Contraseña *</label>
                            <div class="relative">
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" minlength="8"
                                    placeholder="Mínimo 8 caracteres" class="field-input pr-11"
                                    :class="errClass('password')" />
                                <button type="button" @click="showPassword = !showPassword" tabindex="-1"
                                    class="field-input-icon-btn">
                                    <EyeSlashIcon v-if="showPassword" class="w-[18px] h-[18px]" />
                                    <EyeIcon v-else class="w-[18px] h-[18px]" />
                                </button>
                            </div>
                            <p v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</p>
                        </div>
                    </div>
                </div>

                <!-- ══ DATOS DEL VEHÍCULO ══ -->
                <div class="pt-4 border-t" style="border-color: var(--color-line)">
                    <p class="field-label mb-3" style="color: var(--color-brand-600)">Datos del vehículo</p>

                    <div class="flex flex-col gap-3.5">
                        <div>
                            <label class="field-label">Placa *</label>
                            <input v-model="form.placa" maxlength="10" placeholder="ABC-123"
                                class="field-input uppercase" :class="errClass('placa')"
                                @input="form.placa = form.placa.toUpperCase()" />
                            <p v-if="fieldErrors.placa" class="field-error">{{ fieldErrors.placa }}</p>
                        </div>

                        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label class="field-label">Marca *</label>
                                <input v-model="form.marca_vehiculo" placeholder="Honda" class="field-input"
                                    :class="errClass('marca_vehiculo')" />
                                <p v-if="fieldErrors.marca_vehiculo" class="field-error">{{ fieldErrors.marca_vehiculo
                                    }}</p>
                            </div>
                            <div>
                                <label class="field-label">Modelo *</label>
                                <input v-model="form.modelo_vehiculo" placeholder="CB110" class="field-input"
                                    :class="errClass('modelo_vehiculo')" />
                                <p v-if="fieldErrors.modelo_vehiculo" class="field-error">{{ fieldErrors.modelo_vehiculo
                                    }}</p>
                            </div>
                            <div class="col-span-2 sm:col-span-1">
                                <label class="field-label">Año *</label>
                                <input v-model.number="form.anio_vehiculo" type="number" min="1990" :max="anioMaximo"
                                    placeholder="2022" class="field-input" :class="errClass('anio_vehiculo')" />
                                <p v-if="fieldErrors.anio_vehiculo" class="field-error">{{ fieldErrors.anio_vehiculo }}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label class="field-label">Foto del vehículo *</label>
                            <div class="relative">
                                <input ref="fileInput" type="file" accept="image/*" @change="onFotoChange"
                                    class="hidden" />
                                <button type="button" @click="fileInput?.click()" class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed
                                           bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                                    :class="fieldErrors.foto_vehiculo ? 'border-red-300' : ''"
                                    :style="!fieldErrors.foto_vehiculo ? 'border-color: #e5e7eb' : ''">
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
                            <p v-if="fieldErrors.foto_vehiculo" class="field-error">{{ fieldErrors.foto_vehiculo }}</p>
                        </div>

                        <div>
                            <label class="field-label">Número de SOAT <span class="normal-case font-medium"
                                    style="color: var(--color-ink-faint)">(opcional)</span></label>
                            <input v-model="form.soat_numero" placeholder="Si ya lo tienes" class="field-input"
                                :class="errClass('soat_numero')" />
                            <p v-if="fieldErrors.soat_numero" class="field-error">{{ fieldErrors.soat_numero }}</p>
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

// Un mensaje por campo — el mismo objeto sirve tanto para lo que
// detectamos aquí antes de mandar el formulario, como para lo que
// el backend rechace después (los nombres de campo coinciden).
const fieldErrors = reactive<Record<string, string>>({})

function errClass(campo: string) {
    return fieldErrors[campo] ? 'border-red-400 bg-red-50/50' : ''
}

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

// Filtra cualquier caracter que no sea número mientras se escribe —
// evita el problema de fondo: algunos teclados de celular dejan colar
// espacios, guiones o letras que otros no, y eso rompía el registro
// de forma inconsistente entre equipos.
function onDniInput(e: Event) {
    const target = e.target as HTMLInputElement
    const soloNumeros = target.value.replace(/\D/g, '').slice(0, 8)
    form.dni = soloNumeros
    target.value = soloNumeros
}

function onTelefonoInput(e: Event) {
    const target = e.target as HTMLInputElement
    const soloNumeros = target.value.replace(/\D/g, '').slice(0, 9)
    form.telefono = soloNumeros
    target.value = soloNumeros
}

// Revisa TODOS los campos de una — no se detiene en el primero que
// encuentra mal, así se marcan todos los que fallan a la vez.
function validarFormulario(): boolean {
    Object.keys(fieldErrors).forEach((k) => delete fieldErrors[k])

    if (form.dni.length !== 8) fieldErrors.dni = 'Debe tener exactamente 8 dígitos'
    if (!form.nombres.trim()) fieldErrors.nombres = 'Obligatorio'
    if (!form.apellidos.trim()) fieldErrors.apellidos = 'Obligatorio'
    if (!form.fecha_nacimiento) fieldErrors.fecha_nacimiento = 'Obligatorio'
    if (form.telefono.length !== 9) fieldErrors.telefono = 'Debe tener exactamente 9 dígitos'
    if (!form.email.trim()) fieldErrors.email = 'Obligatorio'
    if (form.password.length < 8) fieldErrors.password = 'Mínimo 8 caracteres'
    if (!form.placa.trim()) fieldErrors.placa = 'Obligatorio'
    if (!form.marca_vehiculo.trim()) fieldErrors.marca_vehiculo = 'Obligatorio'
    if (!form.modelo_vehiculo.trim()) fieldErrors.modelo_vehiculo = 'Obligatorio'
    if (!form.anio_vehiculo) fieldErrors.anio_vehiculo = 'Obligatorio'
    if (!form.foto_vehiculo) fieldErrors.foto_vehiculo = 'Debes subir una foto del vehículo'

    return Object.keys(fieldErrors).length === 0
}

async function handleRegister() {
    errorMsg.value = ''
    successMsg.value = ''

    if (!validarFormulario()) {
        errorMsg.value = 'Revisa los campos marcados en rojo'
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
        anio_vehiculo: form.anio_vehiculo!,
        foto_vehiculo: form.foto_vehiculo!,
        soat_numero: form.soat_numero || undefined,
    })
    loading.value = false

    if (result.ok) {
        successMsg.value = result.message
        setTimeout(() => router.push('/verificar-correo'), 1500)
    } else {
        errorMsg.value = result.message
        if (result.errors) {
            Object.entries(result.errors).forEach(([campo, mensajes]) => {
                fieldErrors[campo] = mensajes[0]
            })
        }
    }
}
</script>