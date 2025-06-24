#include <SPI.h>
#include "printf.h"
#include "RF24.h"

#define CE_PIN 7
#define CSN_PIN 8

RF24 radio(CE_PIN, CSN_PIN);
uint8_t address[6] = "1Node";
byte payload[20] = {0};

void setup() {

  Serial.begin(115200);
  while (!Serial) {}

  if (!radio.begin()) {
    Serial.println(F("radio hardware is not responding!!"));
    while (1) {}
  }
  
  radio.setPALevel(RF24_PA_LOW);
  radio.setPayloadSize(20);
  radio.openReadingPipe(1, address);
  radio.startListening();
}

void loop() {
    uint8_t pipe;
    if (radio.available(&pipe)) {
      uint8_t bytes = radio.getPayloadSize();
      radio.read(&payload, bytes);
      Serial.write(payload, 20);
    }

}  // loop