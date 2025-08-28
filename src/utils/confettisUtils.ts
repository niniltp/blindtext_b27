import confetti from 'canvas-confetti';
import fireworkSound from '@/assets/sfx/sfx_fireworks.mp3'
import { useSound } from '@vueuse/sound'

export function launchFireworks(onComplete?: () => void) {
  const duration = 15 * 1000
  const animationEnd = Date.now() + duration
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

  
  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }
  
  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      clearInterval(interval)
      if (onComplete) onComplete()
      return
    }

    const particleCount = 50 * (timeLeft / duration)

    // Explosion côté gauche
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    })

    // Explosion côté droit
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    })
  }, 500)
}