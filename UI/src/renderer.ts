window.serialAPI.getPorts().then((ports) => {
  console.log('Available Ports:', ports);
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loading done');

  const connectBtn = document.getElementById('connectBtn');
  if (!connectBtn) {
    console.error('connectBtn not found');
    return;
  }

  document.getElementById('connectBtn')?.addEventListener('click', () => {
    console.log('click');
    const port = 'COM1';
    const baudRate = 115200;
    window.serialAPI.connect(port, baudRate).then(() => {
      console.log('Connected!');
    });
  });
});
