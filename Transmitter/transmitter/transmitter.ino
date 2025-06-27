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
#define DEVICE_ADDRESS 0x42
#define PHOTORESISTOR_THRESHOLD 200
#define SPEED_CALIBRATION 10000

DHT11 dht11(DHT_PIN);
BMP180 bmp180;
QMC5883LCompass compass;
RF24 radio(CE_PIN, CSN_PIN);

int humidity = 0;
float temperature = 0;
float pressure = 0;
float headingDegrees = 0;
float speed = 0;
uint16_t loops = 0;
unsigned long photoresistor_last_on = 0;

uint8_t address[6] = "1Node";
byte closingTag[2] = { 0xD5, 0xB3 };
byte payload[20];

union parsedData{
 uint8_t b[4];
 float f;
};

void floatToByteArray(float f, byte* ret) {
  union parsedData data;
  data.f = f;
  memcpy(ret, data.b, 4);
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
    Serial.println("dht11 setup start...");
    // dht11.setDelay(50);
    Serial.println("dht11 setup done...");
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
    radio.setPayloadSize(20);
    radio.stopListening(address);

    Serial.println("radio setup done...");
  }
};

class SensorsValues {
public:
  int getHumidity(void) {

    return dht11.readHumidity();
  }

public:
  float getTemperature(void) {
    return bmp180.readTemperature();
  }

public:
  float getPressure(void) {
    return bmp180.readPressure();
  }

public:
  float getCompassHeadingDegree(void) {
    int x, y, z;

    compass.read();

    x = compass.getX();
    y = compass.getY();
    z = compass.getZ();

    float heading = atan2(z, y);

    if (heading < 0) heading += 2 * PI;

    if (heading > 2 * PI) heading -= 2 * PI;

    float headingDegrees = heading * 180 / M_PI;
    return headingDegrees;
  }

public:
  int getPhotoresistance(void) {
    return analogRead(PHOTORESISTANCE_PIN);
  }
};


void setup() {
  Serial.begin(115200);
  
  SensorsSetup sensorsSetup;
  sensorsSetup.setupAllSensors();
}

SensorsValues sensorsValues;
void loop() {

  // int photores = sensorsValues.getPhotoresistance();
  // if (photoresistor_last_on == 0){
  //   if(photores > PHOTORESISTOR_THRESHOLD){
  //     photoresistor_last_on = millis();
  //   }
  // } else {
  //   if(photores < PHOTORESISTOR_THRESHOLD){
  //     speed = (float)SPEED_CALIBRATION/(millis()-photoresistor_last_on);
  //     photoresistor_last_on = 0;
  //   }
  // }


  loops++;
  if (loops > 1000) {
    humidity = sensorsValues.getHumidity();
    temperature = sensorsValues.getTemperature();
    pressure = sensorsValues.getPressure();
    headingDegrees = sensorsValues.getCompassHeadingDegree();


    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Pressure: ");
    Serial.print(pressure);
    Serial.println(" Pa");
    Serial.print("Heading (degrees): ");
    Serial.println(headingDegrees);
    Serial.print("Speed: ");
    Serial.println(speed);


    payload[0] = DEVICE_ADDRESS;
    payload[18] = closingTag[0];
    payload[19] = closingTag[1];

    floatToByteArray(speed, payload + 1);
    floatToByteArray(headingDegrees, payload + 5);
    floatToByteArray(pressure, payload + 9);
    floatToByteArray(temperature, payload + 13);
    payload[17] = (int8_t)humidity;

    if (radio.write(&payload, 20)) {
      Serial.print(F("Transmission successful! "));
    } else {
      Serial.println(F("Transmission failed or timed out"));
    }

    loops = 0;
  }
}

