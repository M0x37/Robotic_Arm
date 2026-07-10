// Servo direkt setzen (sprungartig)
pwm.setPWM(PORT_BASIS, 0, angleToTicks(90));

// Servo sanft bewegen
moveServo(PORT_BASIS, posBasis, 90, 5);
moveServo(PORT_SCHULTER, posSchulter, 45, 5);
moveServo(PORT_ELLBOGEN, posEllbogen, 180, 5);
moveServo(PORT_GREIFER, posGreifer, 45, 5);

// Greifer Auf/Zu
moveServo(PORT_GREIFER, posGreifer, 45, 5);  // AUF
moveServo(PORT_GREIFER, posGreifer, 130, 5); // ZU

// Alle 4 auf gleichen Winkel
moveAll(90, 5);

// moveServo(port, position, zielWinkel, geschwindigkeit);
//   port: PORT_BASIS(0), PORT_SCHULTER(1), PORT_ELLBOGEN(2), PORT_GREIFER(3)
//   position: Variable (wird automatisch aktualisiert)
//   zielWinkel: 0-180 (Schulter max 90)
//   geschwindigkeit: 5 = schnell, 20 = langsam

// moveAll(zielWinkel, geschwindigkeit);
