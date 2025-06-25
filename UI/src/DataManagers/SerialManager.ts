import { SerialPort } from "serialport";

type DataCallback = (data: Buffer) => void;



class SerialManager {
  private currentPort: string;
  private baudRate: number;
  private portInstance: SerialPort | null = null;
  private dataCallbacks: DataCallback[] = [];
  isConnected: boolean = false;

  constructor() {}

  async getPorts() {
    const portList = await SerialPort.list();
    return portList;
  }

  getBaudRates() {
    const baudRates = [9600, 115200];
    return baudRates;
  }

  setPort(port: string) {
    this.currentPort = port;
  }

  setBaudRate(rate: number) {
    this.baudRate = rate;
  }

  async connect(): Promise<boolean> {
    if (!this.currentPort || !this.baudRate) {
      throw new Error('Port and baud rate must be set before connecting');
    }

    return new Promise((resolve, reject) => {
      this.portInstance = new SerialPort({
        path: this.currentPort,
        baudRate: this.baudRate,
      });

      this.portInstance.on('open', () => {
        this.isConnected = true;
        console.log(`connected to ${this.currentPort}, with baud rate ${this.baudRate}`);
        resolve(true);
      });

      this.portInstance.on('error', (err) => {
        this.isConnected = false;
        console.error('Serial error:', err.message);
        reject(err);
      });

      this.portInstance.on('close', () => {
        this.isConnected = false;
        console.log('Serial port closed');
      });

      this.portInstance.on('data', (data: Buffer) => {
        this.dataCallbacks.forEach(callback => callback(data));
      });
    });
  }

  subscribeToUpdates(callback: DataCallback) {
    this.dataCallbacks.push(callback);
  }

  getConnectionStatus(): boolean {
    this.isConnected = this.portInstance !== null && this.portInstance.isOpen;
    return this.isConnected;
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
            this.isConnected = false;
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
