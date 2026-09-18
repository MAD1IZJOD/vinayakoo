import { tone } from '../lib/acoustics'
import './PlanView.css'

// Top-down plan in metres (8 × 7 room), used when the 3D room can't run.
const W = 8
const D = 7

/** A floor-plan fallback for devices without WebGL. Treatment fades in with `progress`. */
export function PlanView({ progress }: { progress: number }) {
  const show = (from: number) => Math.min(1, Math.max(0, (progress - from) / 0.35))
  const ring = `color-mix(in srgb, ${tone.treated} ${progress * 100}%, ${tone.untreated})`

  return (
    <div className="plan-view">
      <svg viewBox="-0.6 -0.6 9.2 8.2" role="img" aria-label="Floor plan of the media room showing where acoustic treatment goes">
        <defs>
          <clipPath id="plan-walls">
            <rect x={0} y={0} width={W} height={D} />
          </clipPath>
        </defs>
        <rect x={0} y={0} width={W} height={D} className="plan-room" />

        {/* screen and speakers on the front wall */}
        <rect x={2.35} y={0.05} width={3.3} height={0.12} className="plan-screen" />
        <rect x={1.52} y={0.52} width={0.36} height={0.38} className="plan-speaker" />
        <rect x={6.12} y={0.52} width={0.36} height={0.38} className="plan-speaker" />

        {/* sound spreading from the speakers */}
        <g clipPath="url(#plan-walls)">
          {[1.7, 6.3].map((cx) =>
            [0.8, 1.5, 2.2].map((r, i) => (
              <circle
                key={`${cx}${r}`}
                cx={cx}
                cy={0.9}
                r={r}
                fill="none"
                stroke={ring}
                strokeWidth={0.04}
                opacity={(0.7 - i * 0.2) * (1 - progress * (i === 0 ? 0.3 : 0.85))}
              />
            )),
          )}
        </g>

        {/* sofa */}
        <rect x={2.5} y={4.55} width={3} height={1.05} rx={0.12} className="plan-sofa" />

        {/* absorption panels on both side walls */}
        {[1.6, 3.1, 4.6].map((y) => (
          <g key={y} opacity={show(0.05)}>
            <rect x={0} y={y - 0.52} width={0.12} height={1.05} className="plan-panel" />
            <rect x={W - 0.12} y={y - 0.52} width={0.12} height={1.05} className="plan-panel" />
          </g>
        ))}

        {/* diffusers beside the screen */}
        <g opacity={show(0.3)}>
          {[0.45, 7.1].map((x) =>
            [0, 1, 4, 2, 2, 4, 1].map((depth, i) => (
              <rect key={`${x}${i}`} x={x + i * 0.13} y={0} width={0.11} height={0.06 + depth * 0.06} className="plan-diffuser" />
            )),
          )}
        </g>

        {/* bass traps in the front corners */}
        <g opacity={show(0.45)}>
          <polygon points="0,0 0.67,0 0,0.67" className="plan-trap" />
          <polygon points={`${W},0 ${W - 0.67},0 ${W},0.67`} className="plan-trap" />
        </g>

        {/* ceiling cloud, drawn dashed because it hangs overhead */}
        <rect x={2.4} y={2.2} width={3.2} height={2.2} className="plan-cloud" opacity={show(0.6)} />
      </svg>
      <p className="plan-note">3D isn&apos;t available on this device, so here is the room from above.</p>
    </div>
  )
}
