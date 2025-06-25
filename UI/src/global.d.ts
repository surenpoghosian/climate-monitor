declare global {
  interface Window {
    serialAPI: {
      getPorts: () => Promise<string[]>;
      getBaudRates: () => Promise<number[]>;
      connect: (port: string, baudRate: number) => Promise<boolean>;
    };
  }
}

export {};