import { useEffect, useRef, useState } from 'react'

const CONFETTI_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e']

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function createParticles(width, height, count) {
  const originX = width / 2
  const originY = Math.min(height * 0.35, 260)

  return Array.from({ length: count }, (_, index) => {
    const angle = randomBetween(0, Math.PI * 2)
    const velocity = randomBetween(2, 8)

    return {
      id: index,
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - randomBetween(2, 6),
      size: randomBetween(5, 11),
      rotation: randomBetween(0, Math.PI * 2),
      rotationVelocity: randomBetween(-0.16, 0.16),
      color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
    }
  })
}

export default function ConfettiCelebration({
  active,
  duration = 1800,
  onComplete,
  particleCount = 150,
}) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!active) {
      setVisible(false)
      return undefined
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return undefined
    }

    const width = window.innerWidth
    const height = window.innerHeight

    canvas.width = width
    canvas.height = height

    const particles = createParticles(width, height, particleCount)
    const startTime = performance.now()
    setVisible(true)

    function renderFrame(currentTime) {
      const elapsed = currentTime - startTime
      context.clearRect(0, 0, width, height)

      particles.forEach((particle) => {
        particle.vy += 0.11
        particle.x += particle.vx
        particle.y += particle.vy
        particle.rotation += particle.rotationVelocity

        context.save()
        context.translate(particle.x, particle.y)
        context.rotate(particle.rotation)
        context.fillStyle = particle.color
        context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
        context.restore()
      })

      if (elapsed < duration) {
        animationFrameRef.current = window.requestAnimationFrame(renderFrame)
        return
      }

      context.clearRect(0, 0, width, height)
      setVisible(false)
      if (onComplete) {
        onComplete()
      }
    }

    animationFrameRef.current = window.requestAnimationFrame(renderFrame)

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      context.clearRect(0, 0, width, height)
    }
  }, [active, duration, onComplete, particleCount])

  if (!visible) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <canvas className="h-full w-full" ref={canvasRef} />
    </div>
  )
}