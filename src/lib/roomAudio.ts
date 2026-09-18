import { RT60 } from './acoustics'

const NOTES = [220, 277.18, 329.63, 440] // A major arpeggio
const LOOP_SECONDS = 2.4

/** Exponentially decaying stereo noise: a simple synthetic room impulse response. */
function impulse(ctx: AudioContext, rt: number) {
  const length = Math.floor(ctx.sampleRate * rt * 1.2)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      // -60 dB of amplitude is a factor of 1e-3, i.e. e^-6.9 over one RT60.
      data[i] = (Math.random() * 2 - 1) * Math.exp((-6.9 * i) / (ctx.sampleRate * rt))
    }
  }
  return buffer
}

/**
 * Plays a short loop (a clap, then a plucked arpeggio) through two synthetic rooms and
 * crossfades between them, so visitors can hear what treatment does to the tail.
 */
export class RoomAudio {
  private ctx: AudioContext | null = null
  private bus: GainNode | null = null
  private wetUntreated: GainNode | null = null
  private wetTreated: GainNode | null = null
  private timer: number | null = null
  private progress = 0

  get playing() {
    return this.timer !== null
  }

  async start() {
    if (!this.ctx) this.setup()
    const ctx = this.ctx!
    await ctx.resume()
    this.schedule()
    this.timer = window.setInterval(() => this.schedule(), LOOP_SECONDS * 1000)
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer)
    this.timer = null
    void this.ctx?.suspend()
  }

  dispose() {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }

  setTreatment(progress: number) {
    this.progress = progress
    if (!this.ctx || !this.wetUntreated || !this.wetTreated) return
    const t = this.ctx.currentTime
    // Equal-power crossfade between the two rooms.
    this.wetUntreated.gain.setTargetAtTime(Math.cos((progress * Math.PI) / 2) * 0.9, t, 0.05)
    this.wetTreated.gain.setTargetAtTime(Math.sin((progress * Math.PI) / 2) * 0.35, t, 0.05)
  }

  private setup() {
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0.5
    master.connect(ctx.destination)

    const bus = ctx.createGain()
    const dry = ctx.createGain()
    dry.gain.value = 0.55
    bus.connect(dry).connect(master)

    const rooms = [RT60.untreated, RT60.treated].map((rt) => {
      const conv = ctx.createConvolver()
      conv.buffer = impulse(ctx, rt)
      const wet = ctx.createGain()
      bus.connect(conv).connect(wet).connect(master)
      return wet
    })

    this.ctx = ctx
    this.bus = bus
    this.wetUntreated = rooms[0]
    this.wetTreated = rooms[1]
    this.setTreatment(this.progress)
  }

  private schedule() {
    const ctx = this.ctx
    const bus = this.bus
    if (!ctx || !bus) return
    const start = ctx.currentTime + 0.05

    // clap
    const noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate)
    const data = noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2
    const clap = ctx.createBufferSource()
    clap.buffer = noise
    const clapGain = ctx.createGain()
    clapGain.gain.value = 0.9
    clap.connect(clapGain).connect(bus)
    clap.start(start)

    // plucked arpeggio
    NOTES.forEach((freq, i) => {
      const at = start + 0.6 + i * 0.16
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.value = freq
      const env = ctx.createGain()
      env.gain.setValueAtTime(0, at)
      env.gain.linearRampToValueAtTime(0.35, at + 0.008)
      env.gain.exponentialRampToValueAtTime(0.0001, at + 0.35)
      osc.connect(env).connect(bus)
      osc.start(at)
      osc.stop(at + 0.4)
    })
  }
}
