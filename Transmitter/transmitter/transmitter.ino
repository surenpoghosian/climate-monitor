#include <QMC5883LCompass.h>
#include <DHT11.h>
#include <BMP180.h>
#include <BMP180DEFS.h>
#include <MetricSystem.h>
#include <Wire.h>

#define DHT_PIN 4
#define PHTRST_PIN A1

DHT11 dht11(DHT_PIN);
BMP180 bmp180;
QMC5883LCompass compass;

int counter = 0;


class SensorsSetup {
    public: void setupAllSensors(void) {
        Serial.println("Setting up the sensors...");
        this->setupDHT11();
        this->setupBMP180();
        this->setupHMC5883L();
        this->setupPhotoresistance();
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
        pinMode(PHTRST_PIN, INPUT);
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
        int photoResistance = analogRead(PHTRST_PIN);
        Serial.print("\nPhotoresistance value: ");
        Serial.print(photoResistance);
        return photoResistance;
    }
};


void setup() {
    // put your setup code here, to run once:
    Serial.begin(9600);
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
}
