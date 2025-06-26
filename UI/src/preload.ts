import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('serialAPI', {
  getPorts: () => ipcRenderer.invoke('serial:getPorts'),
  getBaudRates: () => ipcRenderer.invoke('serial:getBaudRates'),
  connect: (port: string, baudRate: number) => ipcRenderer.invoke('serial:connect', port, baudRate),
  disconnect: () => ipcRenderer.invoke('serial:disconnect'),
  isConnected: () => ipcRenderer.invoke('serial:isConnected'),
  onDataReceived: (callback: (data: any) => void) => ipcRenderer.on('serial:dataReceived', (_event, data) => callback(data)),
  removeDataListener: () => ipcRenderer.removeAllListeners('serial:dataReceived'),
});
