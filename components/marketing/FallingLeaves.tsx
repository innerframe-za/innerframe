'use client'

import { useEffect, useState } from 'react'

// SVG paths for varied leaf silhouettes (viewBox 0 0 20 22)
const LEAF_PATHS = [
  // Simple oval leaf with stem line
  'M10,1 Q18,2 20,10 Q18,20 10,22 Q2,20 0,10 Q2,2 10,1 Z M10,22 L10,18',
  // Asymmetric wide leaf
  'M10,0 Q22,5 18,13 Q14,21 10,22 Q6,21 2,13 Q-2,5 10,0 Z',
  // Pointed elongated leaf
  'M10,0 L19,9 Q18,18 10,22 Q2,18 1,9 Z',
  // Rounded compact leaf
  'M10,3 Q17,3 18,10 Q17,19 10,21 Q3,19 2,10 Q3,3 10,3 Z',
]

const LEAF_COLORS = [
  '#1E3A2F', // dark green
  '#2D5A3D', // mid green
  '#3B6B4A', // light green
  '#8AAF8E', // muted green
  '#D4AF37', // gold
  '#B8960C', // gold-dark
]

interface Leaf {
  id: number
  x: number         // % from left
  size: number      // px
  delay: number     // s
  duration: number  // s
  sway: number      // px horizontal drift
  color: string
  pathIndex: number
}

export function FallingLeaves({ count = 24 }: { count?: number }) {
  const [leaves, setLeaves] = useState<Leaf[]>([])

  useEffect(() => {
    setLeaves(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 97,
        size: 13 + Math.random() * 17,
        delay: Math.random() * 22,
        duration: 11 + Math.random() * 11,
        sway: 20 + Math.random() * 55,
        color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)],
        pathIndex: Math.floor(Math.random() * LEAF_PATHS.length),
      }))
    )
  }, [count])

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 50 }}
    >
      {leaves.map(leaf => (
        <div
          key={leaf.id}
          style={{
            position: 'absolute',
            left: `${leaf.x}%`,
            top: '-60px',
            // opacity is controlled entirely by the leafFall keyframe (peaks at 0.18)
            animation: `leafFall ${leaf.duration}s ${leaf.delay}s infinite linear`,
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 20 22"
            fill={leaf.color}
            style={{
              // motion animation controls horizontal sway + rotation
              '--leaf-sway': `${leaf.sway}px`,
              animation: `leafMotion ${leaf.duration}s ${leaf.delay}s infinite linear`,
            } as React.CSSProperties}
          >
            <path d={LEAF_PATHS[leaf.pathIndex]} />
          </svg>
        </div>
      ))}
    </div>
  )
}
