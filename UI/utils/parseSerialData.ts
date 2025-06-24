function parseSerialData (buffer: Buffer) {
  const deviceAddress = buffer.readUInt8(0);
  const windSpeed = buffer.readFloatLE(1);
  const temperature = buffer.readFloatLE(5);
  const pressure = buffer.readFloatLE(9);
  const humidity = buffer.readFloatLE(13);
  const endingTag = buffer.toString('utf-8', 18, 20);

  return {
    deviceAddress,
    windSpeed,
    temperature,
    pressure,
    humidity,
    endingTag
  }
}

export default parseSerialData;