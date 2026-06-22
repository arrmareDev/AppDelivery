<template>
    <div class="sr-only" aria-live="polite">
        <span v-if="activa">Nuevo pedido disponible</span>
    </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{ activa: boolean }>()

// Sonido usando Web Audio API — no requiere archivo externo
function playAlert() {
    try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

        // Beep 1
        const osc1 = ctx.createOscillator()
        const gain1 = ctx.createGain()
        osc1.connect(gain1)
        gain1.connect(ctx.destination)
        osc1.frequency.value = 880
        gain1.gain.setValueAtTime(0.3, ctx.currentTime)
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
        osc1.start(ctx.currentTime)
        osc1.stop(ctx.currentTime + 0.2)

        // Beep 2
        const osc2 = ctx.createOscillator()
        const gain2 = ctx.createGain()
        osc2.connect(gain2)
        gain2.connect(ctx.destination)
        osc2.frequency.value = 1100
        gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.25)
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45)
        osc2.start(ctx.currentTime + 0.25)
        osc2.stop(ctx.currentTime + 0.45)

        // Beep 3
        const osc3 = ctx.createOscillator()
        const gain3 = ctx.createGain()
        osc3.connect(gain3)
        gain3.connect(ctx.destination)
        osc3.frequency.value = 1320
        gain3.gain.setValueAtTime(0.4, ctx.currentTime + 0.5)
        gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        osc3.start(ctx.currentTime + 0.5)
        osc3.stop(ctx.currentTime + 0.8)

    } catch (e) {
        console.warn('Audio no disponible:', e)
    }
}

watch(() => props.activa, (val) => {
    if (val) playAlert()
})
</script>