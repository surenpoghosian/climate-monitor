import { SerialPort } from "serialport";

type DataCallback = (data: Buffer) => void;



class SerialManager {
  private currentPort: string;
  private baudRate: number;
  private portInstance: SerialPort | null = null;
  private dataCallbacks: DataCallback[] = [];

  constructor() {}

  async getPorts() {
    const portList = await SerialPort.list();
    return portList;
  }

  getBaudRates() {
    const baudRates = [110, 300, 600, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 128000, 256000];
    return baudRates;
  }

  setPort(port: string) {
    this.currentPort = port;
  }

  setBaudRate(rate: number) {
    this.baudRate = rate;
  }

  connect() {
    if (!this.currentPort || !this.baudRate) {
      throw new Error('Port and baud rate must be set before connecting');
    }

    this.portInstance = new SerialPort({
      path: this.currentPort,
      baudRate: this.baudRate,
    });

    this.portInstance.on('open', () => {
      console.log(`connected to ${this.currentPort}, with baud rate ${this.baudRate}`);
    });

    this.portInstance.on('error', (err) => {
      console.error('Serial error:', err.message);
    });

    this.portInstance.on('data', (data: Buffer) => {
      this.dataCallbacks.forEach(callback => callback(data));
    });
  }

  subscribeToUpdates(callback: DataCallback) {
    this.dataCallbacks.push(callback);
  }

  async disconnect(): Promise<boolean> {
    if (this.portInstance && this.portInstance.isOpen) {
      const port = this.portInstance;

      return new Promise((resolve) => {
        port.close((err) => {
          if (err) {
            console.error("Error while closing the port", err.message);
            resolve(false);
          } else {
            console.log('serial port closed');
            resolve(true);
          }
        });
      });
    }

    return true;
  }
}

export default new SerialManager();
