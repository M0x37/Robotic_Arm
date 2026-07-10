#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

#define SERVOMIN  150
#define SERVOMAX  600
#define SERVO_FREQ 50

int port = 0;
int winkel = 45;
bool laeuft = false;

int angleToTicks(int angle) {
  return map(angle, 0, 180, SERVOMIN, SERVOMAX);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pwm.begin();
  pwm.setPWMFreq(SERVO_FREQ);
  delay(10);

  Serial.println("Servo-Endanschlag finden");
  Serial.println("start = Servo faehrt von 45 hochwaerts");
  Serial.println("stop = stoppt und zeigt Winkel");
  pwm.setPWM(port, 0, angleToTicks(45));
}

void loop() {
  if (Serial.available() > 0) {
    String s = Serial.readStringUntil('\n');
    s.trim();
    s.toLowerCase();

    if (s == "start") {
      laeuft = true;
      winkel = 45;
      Serial.println("Fahre hoch... Enter zum stoppen");
    } else if (s == "stop") {
      laeuft = false;
      Serial.print("Gestoppt bei ");
      Serial.print(winkel);
      Serial.println(" Grad");
    }
  }

  if (laeuft && winkel < 180) {
    winkel++;
    pwm.setPWM(port, 0, angleToTicks(winkel));
    delay(50);
  } else if (laeuft && winkel >= 180) {
    laeuft = false;
    Serial.println("Ende bei 180 Grad");
  }
}