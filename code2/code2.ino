/*
 * code2.ino - 4-Axis Robot Arm with ESP32 and PCA9685
 * Serial commands: base|joint1|joint2 VALUE | all VALUE | open | close | start | posi | undo | test
 */

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVOMIN  150
#define SERVOMAX  600
#define SERVO_FREQ 50

const int PORT_BASE     = 0;
const int PORT_SHOULDER = 1;
const int PORT_ELBOW    = 2;
const int PORT_GRIPPER  = 3;

int posBase    = 0;
int posShoulder = 160;
int posElbow   = 0;
int posGripper = 45;

int angleToTicks(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void moveServo(int port, int &currentPos, int targetPos, int speed) {
  if (targetPos > 190) targetPos = 190;
  if (targetPos < 0)   targetPos = 0;
  if (port == PORT_SHOULDER && targetPos < 90) targetPos = 90;
  if (currentPos == targetPos) return;

  while (currentPos != targetPos) {
    currentPos += (currentPos < targetPos) ? 1 : -1;
    pwm.setPWM(port, 0, angleToTicks(currentPos));
    delay(speed);
  }
}

void moveAll(int targetPos, int speed) {
  moveServo(PORT_BASE,     posBase,     targetPos, speed);
  moveServo(PORT_SHOULDER, posShoulder, targetPos, speed);
  moveServo(PORT_ELBOW,    posElbow,    targetPos, speed);
  moveServo(PORT_GRIPPER,  posGripper,  targetPos, speed);
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("Robot Arm Initializing..."));

  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);

  pwm.setPWM(PORT_BASE,     0, angleToTicks(posBase));
  pwm.setPWM(PORT_SHOULDER, 0, angleToTicks(posShoulder));
  pwm.setPWM(PORT_ELBOW,    0, angleToTicks(posElbow));
  pwm.setPWM(PORT_GRIPPER,  0, angleToTicks(posGripper));

  delay(1000);
  Serial.println(F("System ready!"));
}

void loop() {
  if (Serial.available() <= 0) return;

  String s = Serial.readStringUntil('\n');
  s.trim();
  s.toLowerCase();

  if (s == "undo") {
    moveAll(90, 5);
    Serial.println(F("All servos at 90\u00b0"));

  } else if (s == "help") {
    Serial.println(F("Commands: base|joint1(90-190)|joint2 VALUE | all VALUE | open | close | start | posi | undo | test"));

  } else if (s == "posi") {
    Serial.print(F("Base: ")); Serial.print(posBase);
    Serial.print(F(" | Joint1: ")); Serial.print(posShoulder);
    Serial.print(F(" | Joint2: ")); Serial.print(posElbow);
    Serial.print(F(" | Gripper: ")); Serial.println(posGripper);

  } else if (s == "start") {
    moveServo(PORT_BASE,     posBase,     0, 5);
    moveServo(PORT_SHOULDER, posShoulder, 160, 5);
    moveServo(PORT_ELBOW,    posElbow,    0, 5);
    moveServo(PORT_GRIPPER,  posGripper,  45, 5);
    Serial.println(F("All servos at start position"));

  } else if (s.startsWith("all ")) {
    moveAll(s.substring(4).toInt(), 5);
    Serial.print(F("All servos at "));
    Serial.print(s.substring(4).toInt());
    Serial.println(F("\u00b0"));

  } else if (s.startsWith("base ")) {
    moveServo(PORT_BASE, posBase, s.substring(5).toInt(), 5);
    Serial.print(F("Base at "));
    Serial.print(s.substring(5).toInt());
    Serial.println(F("\u00b0"));

  } else if (s.startsWith("joint1 ")) {
    moveServo(PORT_SHOULDER, posShoulder, s.substring(7).toInt(), 5);
    Serial.print(F("Joint1 at "));
    Serial.print(s.substring(7).toInt());
    Serial.println(F("\u00b0"));

  } else if (s.startsWith("joint2 ")) {
    moveServo(PORT_ELBOW, posElbow, s.substring(7).toInt(), 5);
    Serial.print(F("Joint2 at "));
    Serial.print(s.substring(7).toInt());
    Serial.println(F("\u00b0"));

  } else if (s == "open") {
    moveServo(PORT_GRIPPER, posGripper, 45, 5);
    Serial.println(F("Gripper OPEN (45\u00b0)"));

  } else if (s == "close") {
    moveServo(PORT_GRIPPER, posGripper, 140, 5);
    Serial.println(F("Gripper CLOSED (140\u00b0)"));

  } else if (s == "test") {
    Serial.println(F("Test: each servo 0->180->home"));
    moveServo(PORT_BASE, posBase, 0, 5);
    delay(300);
    moveServo(PORT_BASE, posBase, 180, 5);
    delay(300);
    moveServo(PORT_BASE, posBase, 0, 5);
    delay(300);
    moveServo(PORT_SHOULDER, posShoulder, 0, 5);
    delay(300);
    moveServo(PORT_SHOULDER, posShoulder, 90, 5);
    delay(300);
    moveServo(PORT_SHOULDER, posShoulder, 160, 5);
    delay(300);
    moveServo(PORT_ELBOW, posElbow, 0, 5);
    delay(300);
    moveServo(PORT_ELBOW, posElbow, 180, 5);
    delay(300);
    moveServo(PORT_ELBOW, posElbow, 90, 5);
    delay(300);
    moveServo(PORT_GRIPPER, posGripper, 0, 5);
    delay(300);
    moveServo(PORT_GRIPPER, posGripper, 180, 5);
    delay(300);
    moveServo(PORT_GRIPPER, posGripper, 45, 5);
    Serial.println(F("=== Test done ==="));

  } else {
    Serial.print(F("Unknown command: "));
    Serial.println(s);
    Serial.println("Commands: base|joint1(90-190)|joint2 VALUE | all VALUE | open | close | start | posi | undo | test");
  }

  delay(50);
}
