// Reverberation time (RT60): seconds for sound to fall by 60 dB after the source stops.
// Typical values for a ~55 m² media room with hard finishes, and the same room once treated.
export const RT60 = {
  untreated: 1.1,
  treated: 0.32,
}

export const tone = {
  untreated: '#cf7454',
  treated: '#3d9bd6',
}

export const rtAt = (progress: number) => RT60.untreated + (RT60.treated - RT60.untreated) * progress

/** Sound level in dB relative to the start of the decay. */
export const levelAt = (seconds: number, rt: number) => Math.max(-60, (-60 * seconds) / rt)

export const treatments = [
  {
    name: 'Absorption panels',
    where: 'Side walls, at the first reflection points',
    what: 'Stop the earliest echoes from smearing dialogue and blurring where sounds come from.',
  },
  {
    name: 'Diffusers',
    where: 'Front wall, beside the screen',
    what: 'Scatter sound instead of soaking it up, so the room stays lively without ringing.',
  },
  {
    name: 'Bass traps',
    where: 'Floor-to-ceiling in the corners',
    what: 'Low frequencies pile up in corners. Traps tame the boom so bass lands tight.',
  },
  {
    name: 'Ceiling cloud',
    where: 'Suspended above the listening area',
    what: 'Catches the reflection bouncing between ceiling and floor that makes a room feel hollow.',
  },
]
