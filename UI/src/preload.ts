import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('serialAPI', {
  getPorts: () => ipcRenderer.invoke('serial:getPorts'),
  getBaudRates: () => ipcRenderer.invoke('serial:getBaudRates'),
  connect: (port: string, baudRate: number) => ipcRenderer.invoke('serial:connect', port, baudRate),
});