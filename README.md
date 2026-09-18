# Vinacou

Marketing site for Vinacou, a studio that designs and builds acoustic interiors: home theatres, recording rooms, workspaces and halls.

The centrepiece is an interactive 3D media room. Visitors can look around it, switch between **untreated** and **treated**, and watch the treatment appear: absorption panels, QRD diffusers, corner bass traps and a ceiling cloud. The reverb time, sound rings, decay chart and a small Web Audio demo all follow the same switch, so they can hear the difference as well as see it.

## Stack

- React 19 + TypeScript, built with Vite
- three.js via React Three Fiber and drei for the room
- Web Audio API for the listening demo (synthetic impulse responses, no audio files)
- Plain CSS with design tokens in `src/styles/global.css`

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command             | What it does                        |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the local dev server          |
| `npm run build`     | Type-check and build for production |
| `npm run typecheck` | Type-check only                     |
| `npm run lint`      | Lint the codebase                   |
| `npm run preview`   | Serve the production build locally  |

## Configuration

Copy `.env.example` to `.env.local` and fill in the values. Never commit real values.

| Variable                | Purpose                                                                                                                                 |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_CONSULT_ENDPOINT` | JSON form endpoint (for example a Formspree URL) that receives consultation requests. If it's unset, the form opens a pre-filled email instead. |

Contact details in `src/lib/site.ts` are placeholders and should be replaced with the studio's real details before launch.

## Project structure

```
src/
  components/   shared UI: header, footer, decay chart, waveform, error boundary
  sections/     page sections: hero, room, services, process, consultation
  experience/   the 3D room: scene, treatments, sound rings, camera rig, 2D plan fallback
  hooks/        useInView, useTween, useReveal
  lib/          content, acoustics model, audio engine, consultation logic
  styles/       global styles and design tokens
```

## Notes

- The 3D room is code-split and only downloads as the visitor gets close to it. The render loop pauses when the room is off screen.
- On touch devices, sideways swipes rotate the room and vertical swipes scroll the page. The camera widens on narrow screens so both side walls stay in view.
- Without WebGL, or if the 3D scene fails, a 2D floor plan shows the same treatment.
- Motion respects `prefers-reduced-motion`.
- RT60 figures (1.10 s untreated, 0.32 s treated) are typical values for a room of this size, used for illustration.
