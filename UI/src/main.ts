import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import DataManager from './DataManagers/DataManager';
import SerialManager from './DataManagers/SerialManager';
import parseSerialData from './utils/parseSerialData';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

async function main () {
  const serialPorts = await SerialManager.getPorts();
  const portPaths = serialPorts.map(port => port.path);

  DataManager.setAvailableSerialPorts(portPaths);

  SerialManager.subscribeToUpdates((data) => {
    try {
      const parsedData = parseSerialData(data);
      
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('serial:dataReceived', parsedData);
      }
    } catch (error) {
      console.error('Error parsing serial data:', error);
    }
  })
}

main().catch(console.error);

ipcMain.handle('serial:getPorts', async () => {
    const serialPorts = await SerialManager.getPorts();
    const portPaths = serialPorts.map(port => port.path);
    
    DataManager.setAvailableSerialPorts(portPaths);
    
    return portPaths;
});

ipcMain.handle('serial:getBaudRates', async () => {
  return SerialManager.getBaudRates();
});

ipcMain.handle('serial:connect', async (_e, port: string, baudRate: number) => {
  try {
    await SerialManager.disconnect();

    SerialManager.setPort(port);
    SerialManager.setBaudRate(baudRate);
    const connected = await SerialManager.connect();

    console.log(`Connected to ${port}: ${connected}`);
    return connected;
  } catch (error) {
    console.error(`Failed to connect to ${port}:`, error);
    return false;
  }
});

ipcMain.handle('serial:disconnect', async (_e) => {
  const disconnected = await SerialManager.disconnect();

  if (disconnected) {
    console.log(`disconnected: ${disconnected}`);
  } else {
    console.log(`failed to disconnect or already disconnected`);
  }

  return disconnected;
});

ipcMain.handle('serial:isConnected', async (_e) => {
  return SerialManager.getConnectionStatus();
});