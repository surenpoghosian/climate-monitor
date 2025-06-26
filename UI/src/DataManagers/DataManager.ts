class DataManager {
  private availableSerialPorts: string[] = [];

  constructor() {

  }

  getAvailableSerialPorts () {
    return this.availableSerialPorts;
  }

  setAvailableSerialPorts (portPaths: string[]) {
    this.availableSerialPorts = portPaths;
  }
}

export default new DataManager();
