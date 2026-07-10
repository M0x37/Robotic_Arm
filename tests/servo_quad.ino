#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVOMIN  150
#define SERVOMAX  600
#define SERVO_FREQ 50

const int PORT_BASIS    = 0;
const int PORT_SCHULTER = 1;
const int PORT_ELLBOGEN = 2;
const int PORT_GREIFER  = 3;

int angleToTicks(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void setAll(int angle) {
  int ticks = angleToTicks(angle);
  pwm.setPWM(PORT_BASIS,    0, ticks);
  pwm.setPWM(PORT_SCHULTER, 0, ticks);
  pwm.setPWM(PORT_ELLBOGEN, 0, ticks);
  pwm.setPWM(PORT_GREIFER,  0, ticks);
  Serial.print("Alle Servos auf ");
  Serial.print(angle);
  Serial.println(" Grad");
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(10);

  Serial.println(F("=== Servo Quad Control ==="));
  Serial.println(F("Befehle: 0, 90, 180"));
}

void loop() {
  if (Serial.available() > 0) {
    String s = Serial.readStringUntil('\n');
    s.trim();
    int val = s.toInt();

    if (val == 0 && s == "0") {
      setAll(0);
    } else if (val == 90) {
      setAll(90);
    } else if (val == 180) {
      setAll(180);
    }
  }
}