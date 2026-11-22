import Badge from './Badge.jsx';

export default {
  title: 'Primitives/Badge',
  component: Badge,
    argTypes: {
    tone: { control: 'inline-radio', options: ['low', 'mid', 'high', 'todo'] },
    children: { control: 'text' },
  },
  args: { tone: 'low', children: 'Easy · 3/10' },
};

export const Playground = {};

/** Every tone at once — the matrix you check against the design. */
export const AllTones = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <Badge tone="low">Easy · 3/10</Badge>
      <Badge tone="mid">Moderate · 6/10</Badge>
      <Badge tone="high">Hard · 9/10</Badge>
      <Badge tone="todo">Log</Badge>
    </div>
  ),
};
