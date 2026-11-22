import { color as jsColor } from '../../tokens.js';

/* Storybook's Foundations page: renders every token straight from tokens.css so
   the swatch IS the token — if a value changes, this page changes with it.
   Inert until Storybook is installed (step 3). */

export default {
  title: 'Foundations/Tokens',
  parameters: { layout: 'fullscreen' },
};

const Sheet = ({ children }) => (
  <div style={{ padding: 32, background: 'var(--bg)', minHeight: '100vh', fontFamily: 'var(--font-ui)', color: 'var(--text)' }}>
    {children}
  </div>
);

const Section = ({ title, children }) => (
  <section style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
      {title}
    </h2>
    {children}
  </section>
);

const Grid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>{children}</div>
);

const Swatch = ({ name, note }) => (
  <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-surface)' }}>
    <div style={{ height: 56, background: `var(${name})`, borderBottom: '1px solid var(--border)' }} />
    <div style={{ padding: '8px 10px' }}>
      <code style={{ fontSize: 11, color: 'var(--text)' }}>{name}</code>
      {note && <div style={{ fontSize: 10, color: 'var(--split-mid)', marginTop: 3 }}>{note}</div>}
    </div>
  </div>
);

const SURFACES = ['--bg', '--bg-surface', '--bg-raised', '--border', '--border-strong'];
const TEXT = [
  ['--text'], ['--text-nav', 'drift — collapse into --text?'],
  ['--text-dim'], ['--text-label', 'drift — collapse into --text-dim?'], ['--text-muted'],
];
const ACCENT = ['--accent', '--accent-subtle', '--on-accent', '--accent-ghost', '--accent-soft', '--accent-muted', '--accent-hairline'];
const DATA = [
  '--secondary', '--secondary-subtle',
  '--split-fast', '--split-fast-subtle',
  '--split-mid', '--split-mid-subtle',
  '--split-slow', '--split-slow-subtle',
];
const TYPE = [
  ['--text-3xl', 'Page title'], ['--text-2xl', 'Stat value'], ['--text-xl', 'Card title'],
  ['--text-lg', 'Nav item'], ['--text-base', 'Body'], ['--text-md', 'Button'],
  ['--text-sm', 'Meta'], ['--text-xs', 'Caption'], ['--text-2xs', 'Stat label'],
];
const SPACE = ['--space-0-5', '--space-1', '--space-1-5', '--space-2', '--space-2-5', '--space-3',
  '--space-3-5', '--space-4', '--space-4-5', '--space-5', '--space-6', '--space-7', '--space-8', '--space-10'];
const RADII = ['--radius-xs', '--radius-sm', '--radius-md', '--radius-lg', '--radius-pill'];

export const Color = () => (
  <Sheet>
    <Section title="Surfaces"><Grid>{SURFACES.map((n) => <Swatch key={n} name={n} />)}</Grid></Section>
    <Section title="Text"><Grid>{TEXT.map(([n, note]) => <Swatch key={n} name={n} note={note} />)}</Grid></Section>
    <Section title="Accent"><Grid>{ACCENT.map((n) => <Swatch key={n} name={n} />)}</Grid></Section>
    <Section title="Data series"><Grid>{DATA.map((n) => <Swatch key={n} name={n} />)}</Grid></Section>
  </Sheet>
);

export const Typography = () => (
  <Sheet>
    <Section title="Scale">
      {TYPE.map(([n, use]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <code style={{ fontSize: 11, color: 'var(--text-dim)', width: 110, flexShrink: 0 }}>{n}</code>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 90, flexShrink: 0 }}>{use}</span>
          <span style={{ fontSize: `var(${n})` }}>Splits don't lie</span>
        </div>
      ))}
    </Section>
    <Section title="Weights">
      {[['--weight-regular', 400], ['--weight-medium', 500], ['--weight-semibold', 600], ['--weight-bold', 700]].map(([n, w]) => (
        <div key={n} style={{ display: 'flex', alignItems: 'baseline', gap: 20, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
          <code style={{ fontSize: 11, color: 'var(--text-dim)', width: 160, flexShrink: 0 }}>{n}</code>
          <span style={{ fontSize: 18, fontWeight: `var(${n})` }}>Splits don't lie</span>
          {w === 600 && <span style={{ fontSize: 10, color: 'var(--split-mid)' }}>not loaded — browser synthesises this</span>}
        </div>
      ))}
    </Section>
  </Sheet>
);

export const SpacingAndRadii = () => (
  <Sheet>
    <Section title="Spacing">
      {SPACE.map((n) => (
        <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
          <code style={{ fontSize: 11, color: 'var(--text-dim)', width: 110, flexShrink: 0 }}>{n}</code>
          <div style={{ height: 12, width: `var(${n})`, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      ))}
    </Section>
    <Section title="Radii">
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {RADII.map((n) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, background: 'var(--bg-raised)', border: '1px solid var(--border-strong)', borderRadius: `var(${n})`, marginBottom: 8 }} />
            <code style={{ fontSize: 10, color: 'var(--text-dim)' }}>{n}</code>
          </div>
        ))}
      </div>
    </Section>
  </Sheet>
);

/* Guards against tokens.js drifting from tokens.css: reads the computed CSS
   value and shows it next to the JS literal the charts actually use. */
export const CssJsParity = () => {
  const pairs = [
    ['--bg', 'bg'], ['--bg-surface', 'bgSurface'], ['--bg-raised', 'bgRaised'],
    ['--border', 'border'], ['--border-strong', 'borderStrong'],
    ['--text', 'text'], ['--text-dim', 'textDim'], ['--text-muted', 'textMuted'],
    ['--accent', 'accent'], ['--accent-subtle', 'accentSubtle'], ['--on-accent', 'onAccent'],
    ['--secondary', 'secondary'], ['--secondary-subtle', 'secondarySubtle'],
    ['--split-fast', 'splitFast'], ['--split-mid', 'splitMid'], ['--split-slow', 'splitSlow'],
  ];
  const hex = (v) => {
    const m = v.trim().match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return v.trim().toUpperCase();
    return '#' + m.slice(1).map((n) => (+n).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const cs = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : null;
  return (
    <Sheet>
      <Section title="tokens.css ↔ tokens.js">
        <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%', maxWidth: 640 }}>
          <tbody>
            {pairs.map(([cssName, jsName]) => {
              const css = cs ? hex(cs.getPropertyValue(cssName)) : '—';
              const js = jsColor[jsName].toUpperCase();
              const match = css === js;
              return (
                <tr key={cssName} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '8px 12px 8px 0' }}><code style={{ color: 'var(--text-dim)' }}>{cssName}</code></td>
                  <td style={{ padding: 8 }}><code>{css}</code></td>
                  <td style={{ padding: 8 }}><code>color.{jsName}</code></td>
                  <td style={{ padding: 8 }}><code>{js}</code></td>
                  <td style={{ padding: 8, color: match ? 'var(--good)' : 'var(--bad)', fontWeight: 700 }}>{match ? '✓' : '✗'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>
    </Sheet>
  );
};
