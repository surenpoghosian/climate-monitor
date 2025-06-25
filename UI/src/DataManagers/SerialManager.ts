import { SerialPort } from "serialport";
import parseSerialData from "../utils/parseSerialData";

type DataCallback = (data: Buffer) => void;

export enum BaudRate {
  R110 = 110,
  R300 = 300,
  R600 = 600,
  R1200 = 1200,
  R2400 = 2400,
  R4800 = 4800,
  R9600 = 9600,
  R14400 = 14400,
  R19200 = 19200,
  R28800 = 28800,
  R38400 = 38400,
  R57600 = 57600,
  R115200 = 115200,
  R128000 = 128000,
  R256000 = 256000,
}
class SerialManager {
  private currentPort: string;
  private baudRate: number;
  private portInstance: SerialPort | null = null;
  private dataCallbacks: DataCallback[] = [];

  constructor() {}

  async getPortList() {
    const portList = await SerialPort.list();
    return portList;
  }

  setPort(port: string) {
    this.currentPort = port;
  }

  setBaudRate(rate: BaudRate) {
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
      console.log('Arduino says:', { type: typeof data, value: data });
      this.dataCallbacks.forEach(callback => callback(data));
      // console.log(parseSerialData(data as Buffer));
    });
  }

  subscribeToUpdates(callback: DataCallback) {
    this.dataCallbacks.push(callback);
  }

  disconnect() {
    if (this.portInstance && this.portInstance.isOpen) {
      this.portInstance.close((err) => {
        if (err) {
          console.error("Error while closing the port", err.message);
        } else {
          console.log('serial port closed');
        }
      });
    }
  }
}

export default new SerialManager();
