/*
 * code2.ino - 4-Achsen Roboterarm mit ESP32 und PCA9685
 * Serielle Befehle: basis|gelenk1|gelenk2 WERT | all WERT | auf | zu | start | posi | undo | test
 */

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

int posBasis    = 0;
int posSchulter = 160;
int posEllbogen = 90;
int posGreifer  = 45;

int angleToTicks(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void moveServo(int port, int &currentPos, int targetPos, int speed) {
  if (targetPos > 180) targetPos = 180;
  if (targetPos < 0)   targetPos = 0;
  if (currentPos == targetPos) return;

  while (currentPos != targetPos) {
    currentPos += (currentPos < targetPos) ? 1 : -1;
    pwm.setPWM(port, 0, angleToTicks(currentPos));
    delay(speed);
  }
}

void moveAll(int targetPos, int speed) {
  moveServo(PORT_BASIS,    posBasis,    targetPos, speed);
  moveServo(PORT_SCHULTER, posSchulter, targetPos, speed);
  moveServo(PORT_ELLBOGEN, posEllbogen, targetPos, speed);
  moveServo(PORT_GREIFER,  posGreifer,  targetPos, speed);
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("Robot Arm Initialisierung..."));

  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);

  pwm.setPWM(PORT_BASIS,    0, angleToTicks(posBasis));
  pwm.setPWM(PORT_SCHULTER, 0, angleToTicks(posSchulter));
  pwm.setPWM(PORT_ELLBOGEN, 0, angleToTicks(posEllbogen));
  pwm.setPWM(PORT_GREIFER,  0, angleToTicks(posGreifer));

  delay(1000);
  Serial.println(F("System bereit!"));
}

void loop() {
  if (Serial.available() <= 0) return;

  String s = Serial.readStringUntil('\n');
  s.trim();
  s.toLowerCase();

  if (s == "undo") {
    moveAll(90, 5);
    Serial.println(F("Alle Servos auf 90°"));

  } else if (s == "help") {
    Serial.println(F("Befehle: basis|gelenk1|gelenk2 WERT | all WERT | auf | zu | start | posi | undo | test"));

  } else if (s == "posi") {
    Serial.print(F("Basis: ")); Serial.print(posBasis);
    Serial.print(F(" | Gelenk1: ")); Serial.print(posSchulter);
    Serial.print(F(" | Gelenk2: ")); Serial.print(posEllbogen);
    Serial.print(F(" | Greifer: ")); Serial.println(posGreifer);

  } else if (s == "start") {
    moveServo(PORT_BASIS,    posBasis,    0, 5);
    moveServo(PORT_SCHULTER, posSchulter, 160, 5);
    moveServo(PORT_ELLBOGEN, posEllbogen, 90, 5);
    moveServo(PORT_GREIFER,  posGreifer,  45, 5);
    Serial.println(F("Alle Servos auf Startposition"));

  } else if (s.startsWith("all ")) {
    moveAll(s.substring(4).toInt(), 5);
    Serial.print(F("Alle Servos auf "));
    Serial.print(s.substring(4).toInt());
    Serial.println(F(" Grad"));

  } else if (s.startsWith("basis ")) {
    moveServo(PORT_BASIS, posBasis, s.substring(6).toInt(), 5);
    Serial.print(F("Basis auf "));
    Serial.print(s.substring(6).toInt());
    Serial.println(F(" Grad"));

  } else if (s.startsWith("gelenk1 ")) {
    moveServo(PORT_SCHULTER, posSchulter, s.substring(8).toInt(), 5);
    Serial.print(F("Gelenk1 auf "));
    Serial.print(s.substring(8).toInt());
    Serial.println(F(" Grad"));

  } else if (s.startsWith("gelenk2 ")) {
    moveServo(PORT_ELLBOGEN, posEllbogen, s.substring(8).toInt(), 5);
    Serial.print(F("Gelenk2 auf "));
    Serial.print(s.substring(8).toInt());
    Serial.println(F(" Grad"));

  } else if (s == "auf") {
    moveServo(PORT_GREIFER, posGreifer, 45, 5);
    Serial.println(F("Greifer AUF (45°)"));

  } else if (s == "zu") {
    moveServo(PORT_GREIFER, posGreifer, 140, 5);
    Serial.println(F("Greifer ZU (140°)"));

  } else if (s == "test") {
    Serial.println(F("Test: Alle Servos nacheinander 0->180->90"));
    moveServo(PORT_BASIS, posBasis, 0, 5);
    delay(300);
    moveServo(PORT_BASIS, posBasis, 180, 5);
    delay(300);
    moveServo(PORT_BASIS, posBasis, 0, 5);
    delay(300);
    moveServo(PORT_SCHULTER, posSchulter, 0, 5);
    delay(300);
    moveServo(PORT_SCHULTER, posSchulter, 90, 5);
    delay(300);
    moveServo(PORT_SCHULTER, posSchulter, 160, 5);
    delay(300);
    moveServo(PORT_ELLBOGEN, posEllbogen, 0, 5);
    delay(300);
    moveServo(PORT_ELLBOGEN, posEllbogen, 180, 5);
    delay(300);
    moveServo(PORT_ELLBOGEN, posEllbogen, 90, 5);
    delay(300);
    moveServo(PORT_GREIFER, posGreifer, 0, 5);
    delay(300);
    moveServo(PORT_GREIFER, posGreifer, 180, 5);
    delay(300);
    moveServo(PORT_GREIFER, posGreifer, 45, 5);
    Serial.println(F("=== Test fertig ==="));

  } else {
    Serial.print(F("Unbekannter Befehl: "));
    Serial.println(s);
    Serial.println("Befehle: basis|gelenk1|gelenk2 WERT | all WERT | auf | zu | start | posi | undo | test");
  }

  delay(50);
}