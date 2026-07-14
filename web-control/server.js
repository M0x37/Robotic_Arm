const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let port = null;
let parser = null;

io.on('connection', (socket) => {
  socket.emit('status', { connected: port !== null && port.isOpen });

  socket.on('listPorts', async () => {
    try {
      const ports = await SerialPort.list();
      socket.emit('ports', ports.map(p => ({ path: p.path, manufacturer: p.manufacturer || '' })));
    } catch (err) {
      socket.emit('error', 'Fehler beim Auflisten der Ports: ' + err.message);
    }
  });

  socket.on('serialConnect', async (data) => {
    if (port && port.isOpen) {
      socket.emit('error', 'Bereits verbunden');
      return;
    }
    try {
      port = new SerialPort({ path: data.path, baudRate: parseInt(data.baudRate) || 115200 });
      parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
      parser.on('data', (line) => {
        io.emit('serialData', line);
      });
      port.on('open', () => {
        io.emit('status', { connected: true });
        io.emit('serialData', '> Verbunden mit ' + data.path);
      });
      port.on('error', (err) => {
        io.emit('error', 'Serial Error: ' + err.message);
      });
      port.on('close', () => {
        io.emit('status', { connected: false });
        io.emit('serialData', '> Verbindung getrennt');
      });
    } catch (err) {
      io.emit('error', 'Kann nicht verbinden: ' + err.message);
    }
  });

  socket.on('killConnection', () => {
    if (port && port.isOpen) {
      port.close();
    }
    port = null;
    parser = null;
    io.emit('status', { connected: false });
  });

  socket.on('send', (data) => {
    if (!port || !port.isOpen) {
      socket.emit('error', 'Nicht verbunden');
      return;
    }
    const cmd = data.cmd + '\n';
    port.write(cmd, (err) => {
      if (err) {
        socket.emit('error', 'Sendefehler: ' + err.message);
      } else {
        io.emit('serialData', '> ' + data.cmd);
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('Robot Arm Web Control: http://localhost:' + PORT);
});
