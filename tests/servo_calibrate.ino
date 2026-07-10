#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVO_FREQ 50
int port = 0;

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(10);

  Serial.println("Servo Kalibrierung");
  Serial.println("Tippe Werte 100-700 ein und drücke Enter");
  Serial.println("Empfohlene Startwerte: 150, 300, 450, 600");
}

void loop() {
  if (Serial.available() > 0) {
    int val = Serial.parseInt();
    if (val > 0) {
      pwm.setPWM(port, 0, val);
      Serial.print("PWM gesetzt: ");
      Serial.println(val);
    }
  }
}