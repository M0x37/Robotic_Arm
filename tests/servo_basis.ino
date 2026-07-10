#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVOMIN  150
#define SERVOMAX  600
#define SERVO_FREQ 50

void setup() {
  delay(2000);
  Serial.begin(115200);
  while (Serial.available()) Serial.read();

  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);

  Serial.println("Basis-Servo Steuerung");
  Serial.println("Grad eingeben (0-180):");
}

void loop() {
  if (Serial.available() > 0) {
    String s = Serial.readStringUntil('\n');
    s.trim();
    if (s.length() > 0 && isDigit(s.charAt(0))) {
      int val = s.toInt();
      if (val >= 0 && val <= 180) {
        int ticks = map(val, 0, 180, SERVOMIN, SERVOMAX);
        pwm.setPWM(0, 0, ticks);
        Serial.print("Basis auf ");
        Serial.print(val);
        Serial.println(" Grad");
      }
    }
  }
}