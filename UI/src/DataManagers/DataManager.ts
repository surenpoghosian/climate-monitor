class DataManager {
  private availableDevices: string[] = [];
  
  constructor() {

  }

  getAvailableDevices () {
    return this.availableDevices;
  }
}

export default new DataManager();
