window.serialAPI.getPorts().then((ports) => {
  console.log('Available Ports:', ports);
});

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loading done');

  const selectPort = document.getElementById('portSelect');
  const selectBaudRate = document.getElementById('baudRateSelect');
  const connectBtn = document.getElementById('connectBtn');
  const connectionStatus = document.getElementById('connectionStatus');
  const refreshBtn = document.getElementById('refreshBtn');

  if(!selectPort || !selectBaudRate || !connectBtn || !connectionStatus || !refreshBtn) {
    console.error('elements not found');
    return;
  }

  refreshBtn.onclick = refreshPorts;

  window.serialAPI.getBaudRates().then((baudRates) => {
    selectBaudRate.innerHTML = baudRates.map((rate) => `<option value="${rate}">${rate}</option>`).join('');
  });

  const enableControls = () => {
    (selectPort as HTMLSelectElement).disabled = false;
    (selectBaudRate as HTMLSelectElement).disabled = false;
    (connectBtn as HTMLButtonElement).disabled = false;
    (refreshBtn as HTMLButtonElement).disabled = false;
  }

  const disableControls = () => {
    (selectPort as HTMLSelectElement).disabled = true;
    (selectBaudRate as HTMLSelectElement).disabled = true;
    (connectBtn as HTMLButtonElement).disabled = true;
    (refreshBtn as HTMLButtonElement).disabled = true;
  }

  async function handleConnect() {
    const selectedPort = (selectPort as HTMLSelectElement).value;
    const selectedBaudRate = (selectBaudRate as HTMLSelectElement).value;
    
    if (!selectedPort) {
      console.error('No port selected');
      return;
    }

    if (!selectedBaudRate) {
      console.error('No baud rate selected');
      return;
    }

    connectBtn!.textContent = 'Connecting...';
    disableControls();

    try {
      const connected = await window.serialAPI.connect(selectedPort, parseInt(selectedBaudRate));
      if (connected) {
        console.log('Connected successfully!');
      } else {
        console.log('Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      enableControls();
      updateConnectionStatus();
    }
  }

  async function handleDisconnect() {
    connectBtn!.textContent = 'Disconnecting...';
    disableControls();

    try {
      const disconnected = await window.serialAPI.disconnect();
      if (disconnected) {
        console.log('Disconnected successfully!');
      } else {
        console.log('Disconnect failed');
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      enableControls();
      updateConnectionStatus();
    }
  }

  function refreshPorts() {
    window.serialAPI.getPorts().then((ports) => {
      const currentSelection = (selectPort as HTMLSelectElement).value;
      
      const currentPorts = Array.from((selectPort as HTMLSelectElement).options).map(option => option.value).filter(value => value !== "");
      const portsChanged = JSON.stringify(ports.sort()) !== JSON.stringify(currentPorts.sort());
      
      if (portsChanged) {
        if (ports.length === 0) {
          selectPort!.innerHTML = '<option value="">No ports available</option>';
        } else {
          selectPort!.innerHTML = ports.map((port) => `<option value="${port}">${port}</option>`).join('');
        }

        if (ports.includes(currentSelection)) {
          (selectPort as HTMLSelectElement).value = currentSelection;
        }

        clearDisplayValues();
      }

    }).catch((error) => {
      console.error('Error', error);
    });
  }

  function updateConnectionStatus() {
    window.serialAPI.isConnected().then((connected) => {
      if (connected) {
        connectionStatus!.style.backgroundColor = 'green';
        (selectPort as HTMLSelectElement).disabled = true;
        (selectBaudRate as HTMLSelectElement).disabled = true;
        (refreshBtn as HTMLButtonElement).disabled = true;
        connectBtn!.textContent = 'Disconnect';
        connectBtn!.onclick = handleDisconnect;
      } else {
        connectionStatus!.style.backgroundColor = 'red';
        (selectPort as HTMLSelectElement).disabled = false;
        (selectBaudRate as HTMLSelectElement).disabled = false;
        (refreshBtn as HTMLButtonElement).disabled = false;
        connectBtn!.textContent = 'Connect';
        connectBtn!.onclick = handleConnect;
      }
    });
  }

  updateConnectionStatus();
  refreshPorts();
  let autoRefreshInterval = setInterval(() => {
    window.serialAPI.isConnected().then((connected) => {
      if (!connected) {
        refreshPorts();
      }
    });
  }, 3000);

  window.addEventListener('focus', () => {
    window.serialAPI.isConnected().then((connected) => {
      if (!connected) {
        refreshPorts();
      }
    });
  });

  window.addEventListener('beforeunload', () => {
    if (autoRefreshInterval) {
      clearInterval(autoRefreshInterval);
    }
  });

  window.serialAPI.onDataReceived((data) => {
    updateDataDisplay(data);
  });

  function clearDisplayValues() {
    const dataDisplay = document.getElementById('dataDisplay');
    const temperatureEl = document.getElementById('temperature');
    const humidityEl = document.getElementById('humidity');
    const pressureEl = document.getElementById('pressure');
    const windSpeedEl = document.getElementById('windSpeed');
    const windDirectionEl = document.getElementById('windDirection');
    const deviceIdEl = document.getElementById('deviceId');
    const lastUpdateEl = document.getElementById('lastUpdate');

    if (!dataDisplay || !temperatureEl || !humidityEl || !pressureEl || !windSpeedEl || !windDirectionEl || !deviceIdEl || !lastUpdateEl) {
      console.error('elements not found');
      return;
    }

    temperatureEl.textContent = '--';
    humidityEl.textContent = '--';
    pressureEl.textContent = '--';
    windSpeedEl.textContent = '--';
    windDirectionEl.textContent = '--';
    deviceIdEl.textContent = '--';
    lastUpdateEl.textContent = '--';
  }

  function updateDataDisplay(data: any) {
    const dataDisplay = document.getElementById('dataDisplay');
    const temperatureEl = document.getElementById('temperature');
    const humidityEl = document.getElementById('humidity');
    const pressureEl = document.getElementById('pressure');
    const windSpeedEl = document.getElementById('windSpeed');
    const windDirectionEl = document.getElementById('windDirection');
    const deviceIdEl = document.getElementById('deviceId');
    const lastUpdateEl = document.getElementById('lastUpdate');

    if (!dataDisplay || !temperatureEl || !humidityEl || !pressureEl || !windSpeedEl || !windDirectionEl || !deviceIdEl || !lastUpdateEl) {
      console.error('elements not found');
      return;
    }

    temperatureEl.textContent = data.temperature.toFixed(1);
    humidityEl.textContent = data.humidity.toString();
    pressureEl.textContent = data.pressure.toFixed(1);
    windSpeedEl.textContent = data.windSpeed.toFixed(1);
    windDirectionEl.textContent = data.headingDegrees.toFixed(0);
    deviceIdEl.textContent = data.deviceAddress.toString();
    lastUpdateEl.textContent = new Date().toLocaleTimeString();

    console.log('updated data:', data);
  }
});
