import Button from './Button.jsx';

export default {
  title: 'Primitives/Button',
  component: Button,
    argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary'] },
    children: { control: 'text' },
    as: { table: { disable: true } },
  },
  args: { variant: 'primary', children: 'Log Effort' },
};

export const Playground = {};

export const Primary = { args: { variant: 'primary', children: 'Log Effort' } };
export const Secondary = { args: { variant: 'secondary', children: 'View full details →' } };

/** Both variants side by side — eyeball against the Figma button frames. */
export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button variant="primary">Log Effort</Button>
      <Button variant="secondary">View full details →</Button>
    </div>
  ),
};
