// ── Web Audio ──
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playTone(freq, duration, type = 'sine', vol = 0.08) {
  try {
    initAudio();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (_) {}
}

function playClick() { playTone(1200, 0.04, 'square', 0.04); }
function playBlip() { playTone(880, 0.06, 'sine', 0.05); }
function playConnect() {
  playTone(440, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(660, 0.1, 'sine', 0.06), 100);
  setTimeout(() => playTone(880, 0.15, 'sine', 0.06), 200);
}
function playDisconnect() {
  playTone(660, 0.1, 'sine', 0.06);
  setTimeout(() => playTone(440, 0.15, 'sine', 0.06), 120);
}
function playServo() { playTone(300, 0.08, 'sawtooth', 0.02); }

// ── Audio on button click ──
document.addEventListener('click', (e) => {
  if (e.target.closest('.btn')) playClick();
});

// ── Button Ripple ──
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    this.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// ── Connect / Disconnect Effects ──
const connectBtn = document.getElementById('connectBtn');
const statusLed = document.getElementById('statusLed');
let wasConnected = false;
if (connectBtn && statusLed) {
  const obs = new MutationObserver(() => {
    const on = statusLed.classList.contains('on');
    connectBtn.classList.toggle('connect-pulse', !on);
    if (on && !wasConnected) { playConnect(); burstParticles(); }
    if (!on && wasConnected) { playDisconnect(); }
    wasConnected = on;
  });
  obs.observe(statusLed, { attributes: true, attributeFilter: ['class'] });
  connectBtn.classList.toggle('connect-pulse', !statusLed.classList.contains('on'));
}

// ── Serial Data Blip ──
if (typeof socket !== 'undefined') {
  socket.on('serialData', () => playBlip());
  const origEmit = socket.emit;
  socket.emit = function(event, ...args) {
    if (event === 'send') playServo();
    return origEmit.call(this, event, ...args);
  };
}

// ── Particle Canvas ──
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.r = Math.random() * 1.5 + 0.5;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.a = Math.random() * 0.35 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20 || this.x > w + 20) this.reset();
      if (this.y < -20 || this.y > h + 20) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) { p.update(); p.draw(); }

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = dx * dx + dy * dy;
        if (dist < 14400) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${0.04 * (1 - Math.sqrt(dist) / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
})();

// ── CRT Scan Lines ──
const scanlines = document.createElement('div');
scanlines.className = 'scanlines';
document.body.appendChild(scanlines);

// ── Connection Particle Burst ──
function burstParticles() {
  const burst = document.createElement('canvas');
  burst.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(burst);
  const ctx = burst.getContext('2d');
  let w = window.innerWidth, h = window.innerHeight;
  burst.width = w; burst.height = h;
  const cx = w / 2, cy = h / 2;
  const particles = [];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 4 + 2;
    particles.push({
      x: cx, y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 3 + 1,
      life: 1,
      color: Math.random() > 0.5 ? 'rgba(76,175,80,' : 'rgba(255,255,255,'
    });
  }
  function anim() {
    ctx.clearRect(0, 0, w, h);
    let alive = false;
    for (const p of particles) {
      if (p.life <= 0) continue;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.life + ')';
      ctx.fill();
    }
    if (alive) requestAnimationFrame(anim);
    else burst.remove();
  }
  anim();
}
