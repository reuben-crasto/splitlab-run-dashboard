import Modal from './Modal.jsx';

export default {
  title: 'Primitives/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    narrow: { control: 'boolean' },
    onClose: { table: { disable: true } },
  },
  args: { title: 'Unlock editing', subtitle: 'Enter your password to log effort.', narrow: true },
};

export const Playground = {
  render: (args) => (
    <Modal {...args} onClose={() => {}}>
      <div className="log-form">
        <input className="unlock-input" type="password" placeholder="Password" />
        <button type="submit" className="log-submit">Unlock</button>
      </div>
    </Modal>
  ),
};
