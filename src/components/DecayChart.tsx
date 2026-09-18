import { useEffect, useRef, useState, type PointerEvent } from 'react'
import { levelAt, RT60, tone } from '../lib/acoustics'
import './DecayChart.css'

const MAX_T = 1.4
const HEIGHT = 240
const PAD = { top: 16, right: 16, bottom: 34, left: 44 }
const GRID_DB = [0, -20, -40, -60]
const TICKS_S = [0, 0.2, 0.4, 0.6, 0.8, 1, 1.2, 1.4]

const series = [
  { key: 'untreated', label: 'Untreated', rt: RT60.untreated, color: tone.untreated },
  { key: 'treated', label: 'Treated', rt: RT60.treated, color: tone.treated },
] as const

export function DecayChart({ treated }: { treated: boolean }) {
  const wrap = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(520)
  const [hoverT, setHoverT] = useState<number | null>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const plotW = width - PAD.left - PAD.right
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const x = (t: number) => PAD.left + (t / MAX_T) * plotW
  const y = (db: number) => PAD.top + (-db / 60) * plotH
  const narrow = width < 420

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const t = ((e.clientX - rect.left) / rect.width) * MAX_T
    setHoverT(Math.min(MAX_T, Math.max(0, t)))
  }

  return (
    <figure className="decay-chart">
      <figcaption>
        <span className="decay-title">How quickly the room goes quiet</span>
        <span className="decay-legend">
          {series.map((s) => (
            <span key={s.key}>
              <i style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </span>
      </figcaption>

      <div ref={wrap} className="decay-plot">
        <svg width={width} height={HEIGHT} role="img" aria-label="Sound level decay over time, untreated versus treated room">
          {GRID_DB.map((db) => (
            <g key={db}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(db)} y2={y(db)} className="decay-grid" />
              <text x={PAD.left - 8} y={y(db) + 4} textAnchor="end" className="decay-axis">
                {db} dB
              </text>
            </g>
          ))}
          {TICKS_S.filter((_, i) => !narrow || i % 2 === 0).map((t) => (
            <text key={t} x={x(t)} y={HEIGHT - 12} textAnchor="middle" className="decay-axis">
              {t === 0 ? '0 s' : t.toFixed(1)}
            </text>
          ))}

          {series.map((s) => {
            const active = (s.key === 'treated') === treated
            const endT = Math.min(s.rt, MAX_T)
            // label each line partway down, to its right, where the other line is far away
            const labelDb = s.key === 'treated' ? -40 : -24
            const labelT = (-labelDb / 60) * s.rt
            return (
              <g key={s.key} className={`decay-series${active ? ' is-active' : ''}`}>
                <line
                  x1={x(0)}
                  y1={y(0)}
                  x2={x(endT)}
                  y2={y(levelAt(endT, s.rt))}
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle cx={x(endT)} cy={y(levelAt(endT, s.rt))} r={4} fill={s.color} stroke="var(--bg-raised)" strokeWidth={2} />
                <text x={x(labelT) + 12} y={y(labelDb) + 4} className="decay-label">
                  {s.label} · {s.rt.toFixed(2)} s
                </text>
              </g>
            )
          })}

          {hoverT !== null && (
            <line x1={x(hoverT)} x2={x(hoverT)} y1={PAD.top} y2={PAD.top + plotH} className="decay-crosshair" />
          )}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={Math.max(plotW, 0)}
            height={plotH}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHoverT(null)}
          />
        </svg>

        {hoverT !== null && (
          <div
            className="decay-tooltip"
            style={{ left: Math.min(x(hoverT) + 12, width - 150), top: PAD.top }}
            aria-hidden="true"
          >
            <strong>{hoverT.toFixed(2)} s after the sound stops</strong>
            {series.map((s) => (
              <span key={s.key}>
                <i style={{ background: s.color }} />
                {s.label}
                <b>{levelAt(hoverT, s.rt) <= -60 ? 'silent' : `${levelAt(hoverT, s.rt).toFixed(0)} dB`}</b>
              </span>
            ))}
          </div>
        )}
      </div>

      <table className="visually-hidden">
        <caption>Reverberation time (RT60)</caption>
        <tbody>
          {series.map((s) => (
            <tr key={s.key}>
              <th scope="row">{s.label}</th>
              <td>{s.rt} seconds to fall by 60 dB</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
