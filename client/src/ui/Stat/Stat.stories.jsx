import Stat from './Stat.jsx';

export default {
  title: 'Primitives/Stat',
  component: Stat,
    argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    unit: { control: 'text' },
  },
  args: { label: 'Distance', value: '12.40', unit: 'km' },
};

export const Playground = {};

/** The three-up row as it appears in the Last Run card. */
export const StatRow = {
  render: () => (
    <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', maxWidth: 420 }}>
      <Stat label="Distance" value="12.40" unit="km" />
      <Stat label="Avg Pace" value="5:12" unit="/km" />
      <Stat label="Time" value="1:04:30" />
    </div>
  ),
};
