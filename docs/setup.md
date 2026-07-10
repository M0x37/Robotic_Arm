# Ersteinrichtung

## Benotigte Software

- **Arduino IDE** (aktuelle Version)
- **ESP32 Board-Paket** (Boardverwalter: `esp32` von Espressif)
- **Adafruit PWM Servo Driver Library** (Bibliotheksverwalter)

## In Arduino IDE einstellen

1. Board: `ESP32 Dev Module`
2. Port: COM-Port des ESP32
3. Baudrate: 115200

## Code hochladen

```
code2.ino             -> Hauptprogramm (Serielle Steuerung)
tests/
  ROBOT_ARM.ino       -> Alte Version
  servo_basis.ino     -> Nur Basis-Servo testen
  servo_calibrate.ino -> PWM-Werte kalibrieren
  servo_findend.ino   -> Endanschlag finden
  servo_quad.ino      -> Alle 4 auf PWM-Wert
```

## Nach dem Hochladen

- Serielles Terminal offnen
- `start` eingeben -> alle Servos fahren in ihre Startposition
- Nach jedem Reset stehen alle Servos auf ihrer Startposition