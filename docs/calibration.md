# Servo-Kalibrierung

Jeder Servo hat einen leicht anderen PWM-Bereich. Die Werte in `ROBOT_ARM.ino` sind Standardwerte und können angepasst werden.

## Aktuelle Werte

```cpp
#define SERVOMIN  150  // PWM-Ticks fur ca. 0 Grad
#define SERVOMAX  600  // PWM-Ticks fur ca. 180 Grad
```

## Kalibrierung mit servo_calibrate.ino

1. `tests/servo_calibrate.ino` auf den ESP32 laden
2. Serielles Terminal offnen (115200 Baud)
3. Werte zwischen 100-700 eingeben, bis der Servo bei 0 bzw. 180 Grad steht
4. Den unteren Wert als SERVOMIN, den oberen als SERVOMAX eintragen

## Test-Script

`tests/servo_test.ino` fahrt einen Servo testweise durch verschiedene Positionen.