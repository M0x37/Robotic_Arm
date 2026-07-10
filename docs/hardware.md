# Hardware & Verkabelung

## Komponenten

- **ESP32 Dev Board** (Steuerung via I2C)
- **PCA9685 PWM Treiber** (16-Kanal, Adresse 0x40)
- **3x Miuzei 15kg Servo** (Basis, Schulter, Ellbogen)
- **1x MG90S Micro Servo** (Greifer)
- Externes 5V Netzteil (min. 3A)

## Pinbelegung: ESP32 -> PCA9685

| ESP32 | PCA9685 |
|-------|---------|
| 3.3V  | VCC     |
| GND   | GND     |
| GPIO 21 | SDA   |
| GPIO 22 | SCL   |

## Port-Zuweisung: PCA9685 -> Servos

| Port | Gelenk |
|------|--------|
| 0 | Basis |
| 1 | Schulter |
| 2 | Ellbogen |
| 3 | Greifer |

## Stromversorgung

- **PCA9685 Schraubklemme V+** -> 5V Netzteil Plus
- **PCA9685 Schraubklemme GND** -> 5V Netzteil Minus
- Servos NIEMALS direkt an den ESP32 anschließen (Stromspitzen bis 1.8A pro Servo)