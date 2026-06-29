# Edgar Hovsepyan — Portfolio

A production React + Vite + TypeScript implementation of the premium `Edgar Hovsepyan — Portfolio`
design (claude.ai/design handoff). Dark, type-led single page: animated particle field, custom
cursor, scroll-reveal, text-scramble, count-up stats, an expandable career timeline, an awards
moment, and two WebGL shader set-pieces.

## Stack

- React 19 + TypeScript (strict)
- Vite 6 — `@` alias to `src`, three/gsap split into cached vendor chunks
- CSS Modules + design tokens (CSS custom properties)
- three.js + gsap for the WebGL shaders
- Fonts: Saira / Saira Condensed / JetBrains Mono / Instrument Serif / Noto Sans Armenian

## Scripts

```bash
npm install
npm run dev        # dev server
npm run build      # typecheck + production build
npm run preview    # serve the production build
npm run typecheck  # types only
```

## Architecture

```
src/
  data/         typed content (profile, experience, work, expertise, stats, nav, marquee, contact)
  hooks/        useInView, useMagnetic, useTilt, useParallax, useScramble, useReducedMotion
  components/
    effects/    ParticleField, CursorSpotlight, CustomCursor, Grain, ScrollProgress, Preloader
    layout/     Nav, Footer, SideRails
    sections/   Hero, StatsBand, Marquee, Profile, Awards, Timeline, Work, ShaderBand, Expertise, Contact
    ui/         Reveal, Chip, SectionHeader, Counter, turbulent-flow, shader-lines
  styles/       global.css (tokens, base, keyframes)
```

Content lives in `src/data` as typed modules; sections are focused components with co-located CSS
Modules. Every WebGL effect is render-gated (only animates while on-screen and the tab is visible)
and every motion path respects `prefers-reduced-motion`. The hero wordmark is the live
`turbulent-flow` shader masked by `wordmark.png`; the mid `ShaderBand` is the `shader-lines` shader
with scroll parallax. Layout honours iOS safe-area insets via `env(safe-area-inset-*)`.

## Assets

`public/assets/portrait.png`, `public/assets/wordmark.png`, `public/Edgar_Hovsepyan_CV.pdf`.
