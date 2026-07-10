#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVOMIN  150
#define SERVOMAX  600
#define SERVO_FREQ 50

int port = 0;

int angleToTicks(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void setAngle(int target, int speed) {
  int current = 90;
  if (target < current) {
    for (int i = current; i >= target; i--) {
      pwm.setPWM(port, 0, angleToTicks(i));
      delay(speed);
    }
  } else {
    for (int i = current; i <= target; i++) {
      pwm.setPWM(port, 0, angleToTicks(i));
      delay(speed);
    }
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("Servo Test Start");

  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(10);

  Serial.println("100 Grad -> 0 Grad (5ms Schritt)");
  setAngle(0, 5);
  delay(1000);

  Serial.println("0 Grad -> 90 Grad (5ms Schritt)");
  setAngle(90, 5);
  delay(1000);

  Serial.println("90 Grad -> 180 Grad (5ms Schritt)");
  setAngle(180, 5);
  delay(1000);

  Serial.println("180 Grad -> 90 Grad (5ms Schritt)");
  setAngle(90, 5);
}

void loop() {}