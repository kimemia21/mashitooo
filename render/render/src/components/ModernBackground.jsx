import React, { useMemo } from 'react'
import * as THREE from 'three'

const ModernBackground = () => {
  const backgroundTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 1024
    const ctx = canvas.getContext('2d')
    
    // Create modern gradient background
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512)
    gradient.addColorStop(0, '#2a2a3a')
    gradient.addColorStop(0.5, '#1a1a2a')
    gradient.addColorStop(1, '#0f0f1a')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1024, 1024)
    
    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(74, 158, 255, 0.05)'
    ctx.lineWidth = 2
    for (let i = 0; i < 1024; i += 64) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, 1024)
      ctx.moveTo(0, i)
      ctx.lineTo(1024, i)
      ctx.stroke()
    }
    
    // Add some accent dots
    ctx.fillStyle = 'rgba(74, 158, 255, 0.1)'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 1024
      const y = Math.random() * 1024
      const radius = Math.random() * 3 + 1
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <mesh position={[0, 0, -8]} receiveShadow>
      <planeGeometry args={[20, 15]} />
      <meshBasicMaterial map={backgroundTexture} />
    </mesh>
  )
}

export default ModernBackground