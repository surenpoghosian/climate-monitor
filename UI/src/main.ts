import { SerialPort } from 'serialport';
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import DataManager from './DataManagers/DataManager';
import parseSerialData from './utils/parseSerialData';

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

// const port = new SerialPort({
//   path: '/dev/tty.usbmodem21201',
//   baudRate: 115200
// });

// port.on('error', (err) => {
//   console.error('Serial error:', err.message);
// });

// port.on('data', (data) => {
//   console.log('Arduino says:', { type: typeof data, value: data });
//   console.log(parseSerialData(data as Buffer));
// });

async function main () {
  const serialPorts = await SerialPort.list();
  const portPaths = serialPorts.map(port => port.path);

  DataManager.setAvailableSerialPorts(portPaths)
}

main().catch(console.error);