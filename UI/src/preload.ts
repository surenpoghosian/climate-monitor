import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('serialAPI', {
  getPorts: () => ipcRenderer.invoke('serial:getPorts'),
  connect: (port: string, baudRate: number) => ipcRenderer.invoke('serial:connect', port, baudRate),
});