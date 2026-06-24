<template>
    <div class="sr-only" aria-live="polite">
        <span v-if="activa">Nuevo pedido disponible</span>
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{ activa: boolean }>()

// AudioContext singleton — se crea una sola vez y se reutiliza
let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
    try {
        if (!ctx) {
            ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        if (ctx.state === 'suspended') {
            ctx.resume()
        }
        return ctx
    } catch {
        return null
    }
}

// Inicializar el contexto en el primer gesto del usuario
// para que Chrome lo permita cuando llegue un pedido real
function initOnGesture() {
    getCtx()
    window.removeEventListener('click', initOnGesture)
    window.removeEventListener('touchstart', initOnGesture)
}

window.addEventListener('click', initOnGesture, { once: true })
window.addEventListener('touchstart', initOnGesture, { once: true })

function playAlert() {
    const audioCtx = getCtx()
    if (!audioCtx) return

    // 3 beeps ascendentes
    const beeps = [
        { freq: 880, start: 0, end: 0.2 },
        { freq: 1100, start: 0.25, end: 0.45 },
        { freq: 1320, start: 0.5, end: 0.8 },
    ]

    beeps.forEach(({ freq, start, end }) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.frequency.value = freq
        osc.type = 'sine'
        gain.gain.setValueAtTime(0.35, audioCtx.currentTime + start)
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + end)
        osc.start(audioCtx.currentTime + start)
        osc.stop(audioCtx.currentTime + end)
    })
}

watch(() => props.activa, (val) => {
    if (val) playAlert()
})
</script>