function parseSerialData(buffer: Buffer) {
  if (buffer.length < 20) {
    throw new Error(`Expected buffer length of 20, got ${buffer.length}`);
  }

  const deviceAddress = buffer.readUInt8(0);
  const windSpeed = buffer.readFloatLE(1);
  const headingDegrees = buffer.readFloatLE(5);
  const pressure = buffer.readFloatLE(9);
  const temperature = buffer.readFloatLE(13);
  const humidity = buffer.readInt8(17);
  const endingTag = buffer.toString('utf-8', 18, 20);

  return {
    deviceAddress,
    windSpeed,
    headingDegrees,
    pressure,
    temperature,
    humidity,
    endingTag,
  };
}

export default parseSerialData;