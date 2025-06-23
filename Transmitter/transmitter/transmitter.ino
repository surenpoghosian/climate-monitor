#include <QMC5883LCompass.h>
#include <DHT11.h>
#include <BMP180.h>
#include <BMP180DEFS.h>
#include <MetricSystem.h>
#include <Wire.h>
#include <SPI.h>
#include "printf.h"
#include "RF24.h"

#define CE_PIN 7
#define CSN_PIN 8
#define DHT_PIN 4
#define PHOTORESISTANCE_PIN A1
#define RADIO_PAYLOAD_SIZE 1
#define SLAVE_ADDRESS 0x42


DHT11 dht11(DHT_PIN);
BMP180 bmp180;
QMC5883LCompass compass;
RF24 radio(CE_PIN, CSN_PIN);


uint8_t address[][6] = { "1Node" };
byte closingTag[2] = { 0xD5, 0xB3 };
byte payload[20];

void floatToByteArray(float f, byte* ret) {
  unsigned int asInt = *((int*)&f);

  int i;
  for (i = 0; i < 4; i++) {
    ret[i] = (asInt >> 8 * i) & 0xFF;
  }
}

class SensorsSetup {
public:
  void setupAllSensors(void) {
    Serial.println("Setting up the sensors...");
    this->setupDHT11();
    this->setupBMP180();
    this->setupHMC5883L();
    this->setupPhotoresistance();
    this->setupTXRadio();
    Serial.println("Sensors' setup done...");
  }

private:
  void setupDHT11(void) {
    // dht11.setDelay(50);
  }

private:
  void setupBMP180(void) {
    Serial.println("bmp180 setup start...");
    if (!bmp180.begin()) {
      Serial.println("BMP180 not found!");
      while (1)
        ;
    } else {
      Serial.println("bmp180 setup done...");
    }
  }

private:
  void setupHMC5883L(void) {
    Serial.println("compass setup start...");
    compass.init();
    Serial.println("compass setup done...");
  }

private:
  void setupPhotoresistance() {
    pinMode(PHOTORESISTANCE_PIN, INPUT);
  }

private:
  void setupTXRadio() {
    Serial.println("radio setup start...");
    if (!radio.begin()) {
      Serial.println(F("radio hardware is not responding!!"));
      while (1)
        ;
    }

    radio.setPALevel(RF24_PA_LOW);  // RF24_PA_MAX is default.
    radio.setPayloadSize(sizeof(payload));
    radio.stopListening(address[0]);

    Serial.println("radio setup done...");
  }
};

class SensorsValues {
public:
  int getHumidity(void) {
    int humidity = dht11.readHumidity();
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
    return humidity;
  }

public:
  float getTemperature(void) {
    float temperature = bmp180.readTemperature();
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    return temperature;
  }

public:
  float getPressure(void) {
    float pressure = bmp180.readPressure();
    Serial.print("Pressure: ");
    Serial.print(pressure);
    Serial.println(" Pa");
    return pressure;
  }

public:
  float getCompassHeadingDegree(void) {
    int x, y, z;

    // Read compass values
    compass.read();

    // Return XYZ readings
    x = compass.getX();
    y = compass.getY();
    z = compass.getZ();

    float heading = atan2(z, y);

    // Correct for when signs are reversed.
    if (heading < 0) heading += 2 * PI;

    // Check for wrap due to addition of declination.
    if (heading > 2 * PI) heading -= 2 * PI;

    // Convert radians to degrees for readability.
    float headingDegrees = heading * 180 / M_PI;

    Serial.print("\nHeading (degrees): ");
    Serial.println(headingDegrees);
    return headingDegrees;
  }

public:
  int getPhotoresistance(void) {
    int photoResistance = analogRead(PHOTORESISTANCE_PIN);
    Serial.print("\nPhotoresistance value: ");
    Serial.print(photoResistance);
    return photoResistance;
  }
};


void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial.println("SERIAL BEGIN");
  while (!Serial) {
    // some boards need to wait to ensure access to serial over USB
  }

  payload[0] = 0x42;
  payload[18] = closingTag[0];
  payload[19] = closingTag[1];

  SensorsSetup sensorsSetup;
  sensorsSetup.setupAllSensors();
}

SensorsValues sensorsValues;
void loop() {
  int humidity = sensorsValues.getHumidity();
  float temperature = sensorsValues.getTemperature();
  float pressure = sensorsValues.getPressure();
  float degree = sensorsValues.getCompassHeadingDegree();

  // TODO: convert each sensor value into byte chunks (from a 4 byte integer to four separated bytes) and to the payload according to the convention below
  // Packet structure
  // 1byte - 0x42
  // 4bytes (float) - wind direction
  // 4bytes (float) - wind speed
  // 4bytes (float) - air pressure
  // 4bytes (float) - air temperature
  // 1byte (int8) - air humidity

  floatToByteArray(temperature, payload + 13);
  floatToByteArray(pressure, payload + 9);
  floatToByteArray(degree, payload + 5);
  payload[17] = (int8_t)humidity;


  // This device is a TX node
  unsigned long start_timer = micros();                  // start the timer
  bool report = radio.write(&payload, sizeof(payload));  // transmit & save the report
  unsigned long end_timer = micros();                    // end the timer

  if (report) {
    Serial.print(F("Transmission successful! "));  // payload was delivered
    Serial.print(F("Time to transmit = "));
    Serial.print(end_timer - start_timer);  // print the timer result
    Serial.print(F(" us. Sent: "));
  } else {
    Serial.println(F("Transmission failed or timed out"));  // payload was not delivered
  }

  delay(1000);
}
