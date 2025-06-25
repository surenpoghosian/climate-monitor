import { SerialPort } from 'serialport';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import DataManager from './DataManagers/DataManager';
import parseSerialData from './utils/parseSerialData';
import SerialManager, { BaudRate } from './DataManagers/SerialManager';

function createWindow() {
  const wndw = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  wndw.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

async function main () {
  const serialPorts = await SerialManager.getPortList();
  const portPaths = serialPorts.map(port => port.path);

  DataManager.setAvailableSerialPorts(portPaths);

  const ports = DataManager.getAvailableSerialPorts();

  SerialManager.setPort(ports[0]);
  SerialManager.setBaudRate(BaudRate.R115200);
  SerialManager.connect();


  SerialManager.subscribeToUpdates((data) => {
    console.log('Buffer data: ', data);
    const parsed = parseSerialData(data);
    console.log('Parsed data: ', parsed);
  })
}

main().catch(console.error);