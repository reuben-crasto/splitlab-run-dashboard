import '../src/styles.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // SplitLab is a dark-only app. Paint the canvas with the real --bg token and
    // offer a light swatch for contrast checks.
    backgrounds: {
      options: {
        app: { name: 'App', value: '#060C07' },
        light: { name: 'Light', value: '#DCDBCF' },
      },
    },
    a11y: { test: 'todo' },
  },
  initialGlobals: {
    backgrounds: { value: 'app' },
  },
  // Guarantees the dark ground + app font/colour even if the backgrounds
  // toolbar default doesn't apply — the wrapper carries the tokens directly.
  decorators: [
    (Story) => (
      <div
        style={{
          background: 'var(--bg)',
          color: 'var(--text)',
          fontFamily: 'var(--font-ui)',
          minHeight: '100vh',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default preview;
