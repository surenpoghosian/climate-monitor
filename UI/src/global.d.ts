declare global {
  interface Window {
    serialAPI: {
      getPorts: () => Promise<string[]>;
      getBaudRates: () => Promise<number[]>;
      connect: (port: string, baudRate: number) => Promise<boolean>;
      disconnect: () => Promise<boolean>;
      isConnected: () => Promise<boolean>;
    };
  }
}

export {};