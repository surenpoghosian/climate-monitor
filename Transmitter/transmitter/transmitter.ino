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
#define RADIO_PAYLOAD_SIZE 32
#define SLAVE_ADDRESS 0x42

DHT11 dht11(DHT_PIN);
BMP180 bmp180;
QMC5883LCompass compass;
RF24 radio(CE_PIN, CSN_PIN);

int counter = 0;
const byte address[6] = "1Node";
byte payload[32] = {};

class SensorsSetup {
    public: void setupAllSensors(void) {
        Serial.println("Setting up the sensors...");
        this->setupDHT11();
        this->setupBMP180();
        this->setupHMC5883L();
        this->setupPhotoresistance();
        this->setupTXRadio();
        Serial.println("Sensors' setup done...");
    }

    private: void setupDHT11(void) {
        // dht11.setDelay(50);
    }

    private: void setupBMP180(void) {
        Serial.println("bmp180 setup start...");
        if (!bmp180.begin()) {
            Serial.println("BMP180 not found!");
            while (1);
        } else {
            Serial.println("bmp180 setup done...");
        }
    }

    private: void setupHMC5883L(void) {
        Serial.println("compass setup start...");
        compass.init();
        Serial.println("compass setup done...");
    }

    private: void setupPhotoresistance() {
        pinMode(PHOTORESISTANCE_PIN, INPUT);
    }

    private: void setupTXRadio() {
        Serial.println("radio setup start...");
        if (!radio.begin()) {
            Serial.println(F("radio hardware is not responding!!"));
            while (1); // hold in infinite loop
        }

        radio.setPALevel(RF24_PA_LOW);
        radio.setPayloadSize(RADIO_PAYLOAD_SIZE);
        radio.openWritingPipe(address);
        radio.stopListening();
        Serial.println("radio setup done...");
    }
};

class SensorsValues {
    public: int getHumidity(void) {
        int humidity = dht11.readHumidity();
        Serial.print("Humidity: ");
        Serial.print(humidity);
        Serial.println(" %");
        return humidity;
    }

    public: float getTemperature(void) {
        float temperature = bmp180.readTemperature();
        Serial.print("Temperature: ");
        Serial.print(temperature);
        Serial.println(" °C");
        return temperature;
    }

    public: float getPressure(void) {
        float pressure = bmp180.readPressure();
        Serial.print("Pressure: ");
        Serial.print(pressure);
        Serial.println(" Pa");
        return pressure;
    }

    public: float getCompassHeadingDegree(void) {
        int x, y, z;
    
        // Read compass values
        compass.read();

        // Return XYZ readings
        x = compass.getX();
        y = compass.getY();
        z = compass.getZ();

        float heading = atan2(z, y);

        // Correct for when signs are reversed.
        if(heading < 0) heading += 2*PI;

        // Check for wrap due to addition of declination.
        if(heading > 2*PI) heading -= 2*PI;

        // Convert radians to degrees for readability.
        float headingDegrees = heading * 180/M_PI; 

        Serial.print("Heading (degrees): "); Serial.println(headingDegrees);
    }

    public: int getPhotoresistance(void) {
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

    SensorsSetup sensorsSetup;
    sensorsSetup.setupAllSensors();
}


SensorsValues sensorsValues;
void loop() {
    Serial.println("\n\n___________________\n\n");
    counter++;

    if (counter == 1000) {
        sensorsValues.getHumidity();
        sensorsValues.getTemperature();
        sensorsValues.getPressure();
        sensorsValues.getPhotoresistance();
        counter = 0;
    }

    sensorsValues.getPhotoresistance();
    sensorsValues.getCompassHeadingDegree();

    // TODO: convert each sensor value into byte chunks (from a 4 byte integer to four separated bytes) and to the payload according to the convention below
    // Packet structure
    // 1byte - 0x42
    // 4bytes (float) - wind direction
    // 4bytes (float) - wind speed
    // 4bytes (float) - air pressure
    // 4bytes (float) - air temperature
    // 1byte (int8) - air humidity

    unsigned long start_timer = micros();
    bool report = radio.write(&payload, RADIO_PAYLOAD_SIZE);
    unsigned long end_timer = micros();

    if (report) {
        Serial.print(F("Transmission successful! "));
        Serial.print(F("Time to transmit = "));
        Serial.print(end_timer - start_timer);
        Serial.print(F(" us. Sent: "));
        for (int i = 0; i < 32; i++) {
            Serial.print(payload[i]);
            Serial.print(" ");
        }
        Serial.println();
    } else {
        Serial.println(F("Transmission failed or timed out"));
    }

    delay(1000);

}
