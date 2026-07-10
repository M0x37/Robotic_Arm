# Serielle Befehle

Baudrate: **115200**

## Einzelservo-Steuerung

```
basis WERT       - Servo 0 (Basis) auf 0-180°
gelenk1 WERT     - Servo 1 (Schulter) auf 0-180°
gelenk2 WERT     - Servo 2 (Ellbogen) auf 0-180°
```

## Greifer

```
auf              - Greifer offen (45°)
zu               - Greifer zu (140°)
```

## Alle gleichzeitig

```
all WERT         - Alle 4 Servos auf denselben Winkel
```

## Positionen

```
start            - Startposition: Basis 0°, Gelenk1 160°, Gelenk2 90°, Greifer 45°
posi             - Aktuelle Position aller Servos anzeigen
undo             - Alle Servos auf 90°
```

## Test

```
test             - Jeder Servo einzeln: 0° -> 180° -> Startposition
```

## Hilfe

```
help             - Kurzubersicht aller Befehle
```