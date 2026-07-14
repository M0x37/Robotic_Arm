const socket = io();

const statusLed = document.getElementById('statusLed');
const statusLabel = document.getElementById('statusLabel');
const portSelect = document.getElementById('portSelect');
const baudRate = document.getElementById('baudRate');
const connectBtn = document.getElementById('connectBtn');
const disconnectBtn = document.getElementById('disconnectBtn');
const refreshPorts = document.getElementById('refreshPorts');
const serialOutput = document.getElementById('serialOutput');
const clearOutput = document.getElementById('clearOutput');

function setConnected(connected) {
  if (connected) {
    statusLed.classList.add('on');
    statusLabel.textContent = 'ON';
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    portSelect.disabled = true;
    baudRate.disabled = true;
  } else {
    statusLed.classList.remove('on');
    statusLabel.textContent = 'OFF';
    connectBtn.disabled = false;
    disconnectBtn.disabled = true;
    portSelect.disabled = false;
    baudRate.disabled = false;
  }
}

function appendSerial(text) {
  serialOutput.textContent += text + '\n';
  serialOutput.scrollTop = serialOutput.scrollHeight;
}

socket.on('status', (data) => {
  setConnected(data.connected);
});

socket.on('ports', (ports) => {
  portSelect.innerHTML = '<option value="">-- Port --</option>';
  ports.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.path;
    opt.textContent = p.path + (p.manufacturer ? ' (' + p.manufacturer + ')' : '');
    portSelect.appendChild(opt);
  });
  if (ports.length === 0) {
    portSelect.innerHTML = '<option value="">-- No ports --</option>';
  }
});

socket.on('serialData', (line) => {
  appendSerial(line);
});

socket.on('error', (msg) => {
  appendSerial('[ERR] ' + msg);
});

refreshPorts.addEventListener('click', () => {
  socket.emit('listPorts');
});

connectBtn.addEventListener('click', () => {
  const path = portSelect.value;
  if (!path) { appendSerial('[ERR] Select port'); return; }
  socket.emit('serialConnect', { path, baudRate: baudRate.value });
});

disconnectBtn.addEventListener('click', () => {
  socket.emit('disconnect');
});

clearOutput.addEventListener('click', () => {
  serialOutput.textContent = '';
});

document.querySelectorAll('.cmd-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const cmd = btn.dataset.cmd;
    if (!cmd) return;

    let fullCmd = cmd;
    const valMap = {
      basis: 'basisVal',
      gelenk1: 'gelenk1Val',
      gelenk2: 'gelenk2Val',
      all: 'allVal'
    };

    if (valMap[cmd]) {
      const val = document.getElementById(valMap[cmd]).value;
      fullCmd = cmd + ' ' + val;
    }

    socket.emit('send', { cmd: fullCmd });
  });
});

socket.emit('listPorts');
setConnected(false);
