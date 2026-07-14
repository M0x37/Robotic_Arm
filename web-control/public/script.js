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

const armPos = { base: 0, shoulder: 160, elbow: 0, gripper: 45 };

function sync3D() {
  if (window.updateArm3D) {
    window.updateArm3D(armPos.base, armPos.shoulder, armPos.elbow, armPos.gripper);
  }
}

socket.on('serialData', (line) => {
  appendSerial(line);

  let m;

  m = line.match(/^Base:\s*(\d+).*Joint1:\s*(\d+).*Joint2:\s*(\d+).*Gripper:\s*(\d+)/);
  if (m) { armPos.base = +m[1]; armPos.shoulder = +m[2]; armPos.elbow = +m[3]; armPos.gripper = +m[4]; sync3D(); return; }

  m = line.match(/^Base at (\d+)/);
  if (m) { armPos.base = +m[1]; sync3D(); return; }

  m = line.match(/^Joint1 at (\d+)/);
  if (m) { armPos.shoulder = +m[1]; sync3D(); return; }

  m = line.match(/^Joint2 at (\d+)/);
  if (m) { armPos.elbow = +m[1]; sync3D(); return; }

  if (line.includes('Gripper OPEN'))  { armPos.gripper = 45; sync3D(); return; }
  if (line.includes('Gripper CLOSED')) { armPos.gripper = 140; sync3D(); return; }

  if (line.includes('All servos at start')) {
    armPos.base = 0; armPos.shoulder = 160; armPos.elbow = 0; armPos.gripper = 45; sync3D(); return;
  }

  m = line.match(/^All servos at (\d+)/);
  if (m) { const v = +m[1]; armPos.base = v; armPos.shoulder = v; armPos.elbow = v; armPos.gripper = v; sync3D(); return; }
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
  socket.emit('killConnection');
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
      base: 'baseVal',
      joint1: 'joint1Val',
      joint2: 'joint2Val',
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
