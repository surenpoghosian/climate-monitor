window.serialAPI.getPorts().then((ports) => {
  console.log('Available Ports:', ports);
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loading done');

  const selectPort = document.getElementById('portSelect');
  if(!selectPort) {
    console.error('select not found');
    return;
  }

  window.serialAPI.getPorts().then((ports) => {
    selectPort.innerHTML = ports.map((port) => `<option value="${port}">${port}</option>`).join('');
  });

  const selectBaudRate = document.getElementById('baudRateSelect');
  if(!selectBaudRate) {
    console.error('selectBaudRate not found');
    return;
  }

  window.serialAPI.getBaudRates().then((baudRates) => {
    selectBaudRate.innerHTML = baudRates.map((rate) => `<option value="${rate}">${rate}</option>`).join('');
  });

  const connectBtn = document.getElementById('connectBtn');
  if (!connectBtn) {
    console.error('connectBtn not found');
    return;
  }

  document.getElementById('connectBtn')?.addEventListener('click', () => {
    const selectedPort = (selectPort as HTMLSelectElement).value;
    const selectedBaudRate = (selectBaudRate as HTMLSelectElement).value;
    
    if (!selectedPort) {
      console.error('No port selected');
      return;
    }

    if (!selectedBaudRate) {
      console.error('No port selected');
      return;
    }

    window.serialAPI.connect(selectedPort, parseInt(selectedBaudRate)).then(() => {
      console.log('Connected!');
    });
  });
});
