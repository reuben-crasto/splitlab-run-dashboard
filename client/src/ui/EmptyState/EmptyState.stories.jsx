import EmptyState from './EmptyState.jsx';

export default {
  title: 'Primitives/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  argTypes: { children: { control: 'text' } },
  args: { children: 'No runs yet. Connect Strava and complete a run!' },
};

export const Playground = {};
export const Loading = { args: { children: 'Loading runs…' } };
export const Error = { args: { children: 'Error: could not reach Strava.' } };
