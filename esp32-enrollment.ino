// ESP32 R307 Fingerprint Enrollment Code
// This code should be uploaded to your ESP32 to enroll fingerprints on the R307 sensor

#include <Adafruit_Fingerprint.h>

// Use Software Serial for R307 (adjust pins as needed)
SoftwareSerial mySerial(16, 17); // RX, TX pins on ESP32
Adafruit_Fingerprint finger = Adafruit_Fingerprint(&mySerial);

void setup() {
  Serial.begin(115200);
  mySerial.begin(57600);
  
  if (finger.verifyPassword()) {
    Serial.println("Found fingerprint sensor!");
  } else {
    Serial.println("Did not find fingerprint sensor :(");
    while (1) { delay(1); }
  }
}

void loop() {
  Serial.println("Ready to enroll a fingerprint!");
  Serial.println("Please enter the ID # (1-127) you want to save this finger as...");
  
  int id = readNumber();
  if (id == 0) return; // Invalid ID
  
  Serial.print("Enrolling ID #");
  Serial.println(id);
  
  while (!getFingerprintEnroll(id));
}

uint8_t getFingerprintEnroll(int id) {
  int p = -1;
  Serial.print("Waiting for valid finger to enroll as #"); Serial.println(id);
  
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    switch (p) {
    case FINGERPRINT_OK:
      Serial.println("Image taken");
      break;
    case FINGERPRINT_NOFINGER:
      Serial.print(".");
      break;
    default:
      Serial.println("Error taking image");
      return p;
    }
  }

  // Convert image
  p = finger.image2Tz(1);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error converting image");
    return p;
  }

  Serial.println("Remove finger");
  delay(2000);
  
  p = 0;
  while (p != FINGERPRINT_NOFINGER) {
    p = finger.getImage();
  }
  
  Serial.println("Place same finger again");
  
  // Second scan
  p = -1;
  while (p != FINGERPRINT_OK) {
    p = finger.getImage();
    if (p == FINGERPRINT_OK) {
      Serial.println("Image taken");
    }
  }

  // Convert second image
  p = finger.image2Tz(2);
  if (p != FINGERPRINT_OK) {
    Serial.println("Error converting image");
    return p;
  }

  // Create model
  p = finger.createModel();
  if (p == FINGERPRINT_OK) {
    Serial.println("Prints matched!");
  } else {
    Serial.println("Fingerprints did not match");
    return p;
  }

  // Store model
  p = finger.storeModel(id);
  if (p == FINGERPRINT_OK) {
    Serial.println("Stored!");
    Serial.print("Fingerprint enrolled successfully as ID #");
    Serial.println(id);
    return true;
  } else {
    Serial.println("Error storing model");
    return p;
  }
}

uint8_t readNumber(void) {
  uint8_t num = 0;
  
  while (num == 0) {
    while (!Serial.available());
    num = Serial.parseInt();
  }
  return num;
}
