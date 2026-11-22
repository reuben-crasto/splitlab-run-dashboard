import Panel from './Panel.jsx';

export default {
  title: 'Primitives/Panel',
  component: Panel,
  parameters: { layout: 'padded' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
  },
  args: { title: 'This Week', subtitle: 'Week-on-week shifts in volume and pace' },
};

export const Playground = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Panel {...args}>
        <p style={{ color: 'var(--text-dim)' }}>Panel body content goes here.</p>
      </Panel>
    </div>
  ),
};

export const NoHeading = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Panel>
        <p style={{ color: 'var(--text-dim)' }}>A bare panel with no title.</p>
      </Panel>
    </div>
  ),
};
