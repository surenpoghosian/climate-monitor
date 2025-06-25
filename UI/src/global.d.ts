declare global {
  interface Window {
    serialAPI: {
      getPorts: () => Promise<string[]>;
      connect: (port: string, baudRate: number) => Promise<boolean>;
    };
  }
}

export {};