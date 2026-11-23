import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// One round, eighteen seconds: deal the name, state the role, count the
// numbers, stamp the award, walk the site, end on the king.
const INK = '#07070a';
const PAPER = '#f4f4f5';
const GOLD = '#e5c07b';
const BLUE = '#4d7cff';
const SOFT = '#9fb8ff';
const MUTED = '#8a8a94';

const COND = "'Saira Condensed', sans-serif";
const SANS = "'Saira', sans-serif";
const ARM = "'Noto Sans Armenian', sans-serif";

const SCENES = { loader: 66, name: 96, stats: 90, award: 96, walk: 132, end: 90 } as const;
const OVERLAP = 6;
export const REEL_FRAMES =
  Object.values(SCENES).reduce((sum, length) => sum + length, 0) - OVERLAP * (Object.keys(SCENES).length - 1);

const FONTS: [family: string, file: string, weight: string][] = [
  ['Saira Condensed', 'SairaCondensed-700-latin.woff2', '700'],
  ['Saira Condensed', 'SairaCondensed-800-latin.woff2', '800'],
  ['Saira Condensed', 'SairaCondensed-900-latin.woff2', '900'],
  ['Saira', 'Saira-400-latin.woff2', '400'],
  ['Noto Sans Armenian', 'NotoSansArmenian-500-armenian.woff2', '500'],
];

function useFonts() {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all(
      FONTS.map(([family, file, weight]) =>
        new FontFace(family, `url(${staticFile(`fonts/${file}`)})`, { weight }).load().then((face) => {
          document.fonts.add(face);
        }),
      ),
    )
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
}

const expo = Easing.bezier(0.16, 1, 0.3, 1);
const ramp = (frame: number, from: number, to: number, a = 0, b = 1, easing = expo) =>
  interpolate(frame, [from, to], [a, b], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing });

const label: CSSProperties = {
  fontFamily: SANS,
  fontSize: 22,
  letterSpacing: '0.34em',
  textTransform: 'uppercase',
  color: MUTED,
};

/** A hard cut made physical: a slab wipes across at the end of every scene. */
function Slab({ length, color = GOLD }: { length: number; color?: string }) {
  const frame = useCurrentFrame();
  const x = ramp(frame, length - 12, length, -100, 100, Easing.bezier(0.76, 0, 0.24, 1));
  return <AbsoluteFill style={{ background: color, transform: `translateX(${x}%)` }} />;
}

function Mask({ children, at, frame, style }: { children: ReactNode; at: number; frame: number; style?: CSSProperties }) {
  const y = ramp(frame, at, at + 22, 110, 0);
  return (
    <div style={{ overflow: 'hidden', ...style }}>
      <div style={{ transform: `translateY(${y}%)` }}>{children}</div>
    </div>
  );
}

function Loader() {
  const frame = useCurrentFrame();
  const count = Math.round(ramp(frame, 0, 52, 0, 100, Easing.out(Easing.cubic)));
  return (
    <AbsoluteFill style={{ background: INK, padding: 72 }}>
      <div style={{ ...label, display: 'flex', justifyContent: 'space-between' }}>
        <span>Edgar Hovsepyan</span>
        <span>Portfolio · 2026</span>
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        {[...'ԷԴԳԱՐ'].map((letter, index) => (
          <Mask key={index} at={4 + index * 4} frame={frame}>
            <span style={{ display: 'block', fontFamily: ARM, fontWeight: 500, fontSize: 400, lineHeight: 1.1, color: PAPER }}>
              {letter}
            </span>
          </Mask>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 72, right: 72, bottom: 60, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={label}>Shuffling the deck</span>
        <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 220, lineHeight: 0.8, color: PAPER }}>
          {String(count).padStart(3, '0')}
        </span>
      </div>
      <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${count}%`, background: BLUE }} />
      <Slab length={SCENES.loader} />
    </AbsoluteFill>
  );
}

function Name() {
  const frame = useCurrentFrame();
  const zoom = ramp(frame, 0, SCENES.name, 1.12, 1.02, Easing.linear);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Img src={staticFile('shots/hero.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, opacity: 0.5 }} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(7,7,10,.96) 0%, rgba(7,7,10,.7) 46%, rgba(7,7,10,.1) 100%)' }} />
      <AbsoluteFill style={{ padding: '0 96px', justifyContent: 'center' }}>
        <Mask at={6} frame={frame}>
          <div style={{ ...label, color: GOLD }}>SBC Americas 2025 GotY shortlist / BFTH Arena 2024 finalist</div>
        </Mask>
        <Mask at={10} frame={frame} style={{ marginTop: 26 }}>
          <div style={{ fontFamily: COND, fontWeight: 900, fontSize: 300, lineHeight: 0.84, color: PAPER, textTransform: 'uppercase' }}>Edgar</div>
        </Mask>
        <Mask at={16} frame={frame}>
          <div style={{ fontFamily: COND, fontWeight: 900, fontSize: 300, lineHeight: 0.84, color: BLUE, textTransform: 'uppercase' }}>Hovsepyan</div>
        </Mask>
        <div style={{ height: 8, width: ramp(frame, 26, 50, 0, 520), background: GOLD, marginTop: 34 }} />
        <Mask at={30} frame={frame} style={{ marginTop: 30 }}>
          <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 76, lineHeight: 1, color: PAPER, textTransform: 'uppercase' }}>
            Senior iGaming Engineer
          </div>
        </Mask>
        <Mask at={36} frame={frame} style={{ marginTop: 10 }}>
          <div style={{ fontFamily: COND, fontWeight: 700, fontSize: 52, lineHeight: 1.1, color: SOFT, textTransform: 'uppercase' }}>
            Games · Platform · Tooling
          </div>
        </Mask>
      </AbsoluteFill>
      <Slab length={SCENES.name} color={PAPER} />
    </AbsoluteFill>
  );
}

const STATS: [value: number, suffix: string, text: string, gold?: boolean][] = [
  [7, '+', 'Years in game dev'],
  [50, '+', 'Games shipped end to end'],
  [14, '+', 'Game verticals'],
  [120, '', 'FPS on mid-tier mobile', true],
];

function Stats() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK, padding: '0 96px', justifyContent: 'center' }}>
      <Mask at={2} frame={frame}>
        <div style={label}>By the numbers</div>
      </Mask>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginTop: 40, borderTop: `4px solid ${PAPER}` }}>
        {STATS.map(([value, suffix, text, gold], index) => {
          const start = 6 + index * 7;
          const shown = Math.round(ramp(frame, start, start + 40, 0, value, Easing.out(Easing.cubic)));
          return (
            <div key={text} style={{ padding: '44px 28px 0', borderLeft: index ? '2px solid rgba(255,255,255,.14)' : 'none', paddingLeft: index ? 28 : 0, opacity: ramp(frame, start, start + 12) }}>
              <div style={{ fontFamily: COND, fontWeight: 900, fontSize: 290, lineHeight: 0.8, color: gold ? GOLD : PAPER, fontVariantNumeric: 'tabular-nums' }}>
                {shown}
                <span style={{ color: BLUE }}>{suffix}</span>
              </div>
              <div style={{ ...label, marginTop: 30, fontSize: 21 }}>{text}</div>
            </div>
          );
        })}
      </div>
      <Slab length={SCENES.stats} color={BLUE} />
    </AbsoluteFill>
  );
}

function Award() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slam = spring({ frame: frame - 34, fps, config: { damping: 11, stiffness: 190, mass: 0.7 } });
  const left = ramp(frame, 4, 30, -34, 0);
  const right = ramp(frame, 8, 34, 34, 0);
  return (
    <AbsoluteFill style={{ background: INK, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', right: -40, top: '50%', transform: `translateY(${ramp(frame, 0, SCENES.award, -44, -56, Easing.linear)}%)`, fontFamily: COND, fontWeight: 900, fontSize: 900, lineHeight: 0.8, color: 'transparent', WebkitTextStroke: '2px rgba(229,192,123,.22)' }}>
        2025
      </div>
      <AbsoluteFill style={{ padding: '0 96px', justifyContent: 'center' }}>
        <div style={{ ...label, color: GOLD }}>Recognition · SBC Awards Americas 2025</div>
        <div style={{ marginTop: 24, fontFamily: COND, fontWeight: 900, fontSize: 330, lineHeight: 0.82, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          <div style={{ color: PAPER, transform: `translateX(${left}%)`, opacity: ramp(frame, 4, 18) }}>Game of</div>
          <div style={{ color: GOLD, textAlign: 'right', transform: `translateX(${right}%)`, opacity: ramp(frame, 8, 22) }}>the Year</div>
        </div>
        <div style={{ ...label, marginTop: 34, color: PAPER, opacity: ramp(frame, 46, 60) }}>
          Non-Stop Roulette · Pascal Gaming · team credit · Colombia · Peru · Brazil
        </div>
      </AbsoluteFill>
      <div style={{ position: 'absolute', left: 96, top: 600, transform: `rotate(-8deg) scale(${interpolate(slam, [0, 1], [3, 1])})`, opacity: Math.min(1, slam * 3), padding: '12px 34px 8px', border: `6px solid ${PAPER}`, background: 'rgba(7,7,10,.9)', boxShadow: `16px 16px 0 ${GOLD}`, fontFamily: COND, fontWeight: 800, fontSize: 84, letterSpacing: '0.08em', lineHeight: 1, color: PAPER, textTransform: 'uppercase' }}>
        Shortlisted
      </div>
      <Slab length={SCENES.award} />
    </AbsoluteFill>
  );
}

const WALK: [file: string, number: string, name: string][] = [
  ['career', '03', 'Career'],
  ['work', '04', 'Things I built'],
  ['games', '05', 'Play the work'],
  ['studio', '06', 'Studio'],
  ['stack', '07', 'The stack'],
  ['cv', '08', 'CV'],
];

function Walk() {
  const frame = useCurrentFrame();
  const each = SCENES.walk / WALK.length;
  const index = Math.min(WALK.length - 1, Math.floor(frame / each));
  const local = frame - index * each;
  const [file, number, name] = WALK[index]!;
  // Hard cuts, with a short push-in on every still so nothing sits dead.
  const scale = interpolate(local, [0, each], [1.07, 1.0], { extrapolateRight: 'clamp' });
  const wipe = ramp(local, 0, 7, 100, 0, Easing.bezier(0.76, 0, 0.24, 1));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Img src={staticFile(`shots/${file}.jpg`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, clipPath: `inset(0 0 ${wipe}% 0)` }} />
      <div style={{ position: 'absolute', left: 0, bottom: 0, display: 'flex', alignItems: 'stretch' }}>
        <div style={{ background: GOLD, color: INK, fontFamily: COND, fontWeight: 900, fontSize: 96, lineHeight: 1, padding: '18px 30px 12px' }}>{number}</div>
        <div style={{ background: INK, color: PAPER, fontFamily: COND, fontWeight: 800, fontSize: 96, lineHeight: 1, padding: '18px 40px 12px', textTransform: 'uppercase' }}>{name}</div>
      </div>
      <div style={{ position: 'absolute', right: 60, top: 54, ...label, color: PAPER }}>
        Gate {number} / 09
      </div>
      <Slab length={SCENES.walk} color={PAPER} />
    </AbsoluteFill>
  );
}

function End() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Img src={staticFile('shots/finale.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${ramp(frame, 0, SCENES.end, 1.1, 1.0, Easing.linear)})`, opacity: 0.55 }} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(7,7,10,.95) 0%, rgba(7,7,10,.55) 55%, rgba(7,7,10,.15) 100%)' }} />
      <AbsoluteFill style={{ padding: '0 96px', justifyContent: 'center' }}>
        {['Games', 'Platform', 'Tooling'].map((word, index) => (
          <Mask key={word} at={4 + index * 6} frame={frame}>
            <div style={{ fontFamily: COND, fontWeight: 900, fontSize: 230, lineHeight: 0.86, textTransform: 'uppercase', color: index === 1 ? 'transparent' : PAPER, WebkitTextStroke: index === 1 ? `3px ${PAPER}` : undefined }}>
              {word}
            </div>
          </Mask>
        ))}
        <div style={{ height: 8, width: ramp(frame, 26, 48, 0, 620), background: GOLD, marginTop: 40 }} />
        <Mask at={34} frame={frame} style={{ marginTop: 30 }}>
          <div style={{ fontFamily: COND, fontWeight: 800, fontSize: 84, lineHeight: 1, color: GOLD }}>edgarhovsepyan.github.io</div>
        </Mask>
        <Mask at={40} frame={frame} style={{ marginTop: 14 }}>
          <div style={label}>Edgar Hovsepyan · Senior iGaming Engineer · Yerevan, remote or on site</div>
        </Mask>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export function Reel() {
  useFonts();
  const order: [keyof typeof SCENES, () => JSX.Element][] = [
    ['loader', Loader],
    ['name', Name],
    ['stats', Stats],
    ['award', Award],
    ['walk', Walk],
    ['end', End],
  ];
  let from = 0;
  return (
    <AbsoluteFill style={{ background: INK }}>
      {order.map(([key, Scene], index) => {
        const start = from;
        from += SCENES[key] - OVERLAP;
        // Later scenes sit underneath, so the outgoing slab reveals them.
        return (
          <Sequence key={key} from={start} durationInFrames={SCENES[key]} style={{ zIndex: order.length - index }}>
            <Scene />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
