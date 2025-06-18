#include <DHT11.h>
#include <BMP180.h>
#include <BMP180DEFS.h>
#include <MetricSystem.h>
#include <Wire.h>

DHT11 dht11(4);
BMP180 bmp180;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  Serial.println("setting up...");
  Serial.println("setup done!");
    if (!bmp180.begin())
    {
        Serial.println("BMP180 not found!");
        while (1);
    }
}

void loop() {
  // put your main code here, to run repeatedly:
  int temperature = 0;
  int humidity = 0;
  int pressure = 0;

  // Attempt to read the temperature and humidity values from the DHT11 sensor.
  int result = dht11.readTemperatureHumidity(temperature, humidity);
  dht11.setDelay(50);
  pressure = bmp180.readPressure();


  // Check the results of the readings.
  // If the reading is successful, print the temperature and humidity values.
  // If there are errors, print the appropriate error messages.
  if (result == 0) {
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print(" °C\tHumidity: ");
      Serial.print(humidity);
      Serial.println(" %");
  } else {
      // Print error message based on the error code.
      Serial.println(DHT11::getErrorString(result));
  }
   Serial.print("Pressure: ");
    Serial.print(bmp180.readPressure());
    Serial.println(" Pa");

    Serial.print("Temperature BMP: ");
    Serial.print(bmp180.readTemperature());
    Serial.println(" °C");

    delay(1000);
}
