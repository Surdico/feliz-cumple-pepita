/* =========================================================
   TU CONFIGURACIÓN
   Cambia estos datos por los de la persona cumpleañera.
   También puedes personalizar el nombre desde la URL:
   https://tu-usuario.github.io/tu-repo/?nombre=Ana
   ========================================================= */

const CONFIG = {
  nombre: "Pepita",
  mensaje: `¡Muy feliz cumpleaños mi amor! ❤️ 

Espero que hoy tengas un día tan lindo como tú y que este nuevo año de vida venga cargado de cosas buenas, alegrías y momentos que te hagan muy feliz.

Me alegra mucho haberte conocido este año y, sobre todo, ver cómo, con el tiempo, hemos ido construyendo un vínculo cada vez más bonito. Me gusta mucho tu forma de ser, tu humor, tu inteligencia y esa capacidad que tienes de hacer que podamos conversar de cualquier cosa, sin importar el tema o la hora. Me encanta lo linda que eres, pero también esa confianza que hemos ido construyendo y que hace que disfrute tanto compartir contigo.

De corazón, te deseo todas las buenas energías para esta nueva vuelta al sol. Que nunca te falten las ganas, las oportunidades ni la confianza para ir detrás de todo aquello que te propongas. Ojalá puedas cumplir cada uno de tus planes, alcanzar tus metas y, sobre todo, disfrutar mucho del camino.

Gracias por las conversaciones, las risas y por permitirme conocerte un poquito más cada día. Espero que la vida te devuelva en cosas lindas toda esa luz que tienes.

¡Que tengas un cumpleaños precioso!`,
  firma: "Te quiero mucho mi pequeñita hermosa! ❤️",
};

// ---------------------------------------------------------
// Elementos y personalización
// ---------------------------------------------------------

const params = new URLSearchParams(window.location.search);
const nombre = (params.get("nombre") || CONFIG.nombre || "").trim();

const gift = document.getElementById("gift");
const intro = document.getElementById("intro");
const message = document.getElementById("message");
const cardTitle = document.getElementById("card-title");
const cardName = document.getElementById("card-name");
const cardText = document.getElementById("card-text");
const cardSign = document.getElementById("card-sign");
const again = document.getElementById("again");
const soundButton = document.getElementById("sound");
const balloonLayer = document.getElementById("balloons");

cardName.textContent = nombre;
cardText.textContent = CONFIG.mensaje;
cardSign.textContent = CONFIG.firma;

// Una carta larga se lee mejor alineada a la izquierda y con más ancho.
if (CONFIG.mensaje.length > 600) {
  message.classList.add("card--long");
}

document.title = nombre ? `¡Feliz cumpleaños, ${nombre}! 🎉` : "¡Feliz cumpleaños! 🎉";

const forceMotion = params.get("motion") === "1";
const reduceMotion = !forceMotion && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ---------------------------------------------------------
// Música: "Cumpleaños feliz" sintetizada con Web Audio
// (sin archivos externos, así funciona sin conexión)
// ---------------------------------------------------------

const Sound = (() => {
  // [frecuencia en Hz, duración en tiempos]
  const MELODY = [
    [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [523.25, 1], [493.88, 2],
    [392.0, 0.75], [392.0, 0.25], [440.0, 1], [392.0, 1], [587.33, 1], [523.25, 2],
    [392.0, 0.75], [392.0, 0.25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440.0, 2],
    [698.46, 0.75], [698.46, 0.25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2],
  ];
  const BEAT = 0.42;
  const VOLUME = 0.3;

  let ctx = null;
  let master = null;
  let currentBus = null;
  let enabled = true;

  try {
    enabled = window.localStorage.getItem("cumple-sound") !== "off";
  } catch (error) {
    // localStorage puede estar bloqueado; el sonido queda activado por defecto.
  }

  function ensureContext() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return null;

    if (!ctx) {
      try {
        ctx = new AudioCtor();
        master = ctx.createGain();
        master.gain.value = enabled ? VOLUME : 0.0001;
        master.connect(ctx.destination);
      } catch (error) {
        ctx = null;
        master = null;
        return null;
      }
    }

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    return ctx;
  }

  function playNote(ac, destination, frequency, start, duration) {
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.92);
    gain.connect(destination);

    const osc = ac.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(frequency, start);
    osc.connect(gain);
    osc.start(start);
    osc.stop(start + duration + 0.1);

    // Armónico suave una octava abajo para dar calidez.
    const sub = ac.createOscillator();
    sub.type = "sine";
    sub.frequency.setValueAtTime(frequency / 2, start);
    const subGain = ac.createGain();
    subGain.gain.value = 0.28;
    sub.connect(subGain);
    subGain.connect(gain);
    sub.start(start);
    sub.stop(start + duration + 0.1);
  }

  function play() {
    if (!enabled) return;

    const ac = ensureContext();
    if (!ac) return;

    if (currentBus) {
      const old = currentBus;
      try {
        old.gain.cancelScheduledValues(ac.currentTime);
        old.gain.setTargetAtTime(0.0001, ac.currentTime, 0.04);
        window.setTimeout(() => old.disconnect(), 400);
      } catch (error) {
        // La melodía anterior ya había terminado.
      }
    }

    const bus = ac.createGain();
    bus.gain.value = 1;
    bus.connect(master);
    currentBus = bus;

    let time = ac.currentTime + 0.12;
    for (const [frequency, beats] of MELODY) {
      const duration = beats * BEAT;
      playNote(ac, bus, frequency, time, duration);
      time += duration;
    }

    const totalMs = (time - ac.currentTime + 0.5) * 1000;
    window.setTimeout(() => {
      if (currentBus === bus) currentBus = null;
      try {
        bus.disconnect();
      } catch (error) {
        // Nada que limpiar.
      }
    }, totalMs);
  }

  function setEnabled(value) {
    enabled = value;

    try {
      window.localStorage.setItem("cumple-sound", enabled ? "on" : "off");
    } catch (error) {
      // Sin persistencia si localStorage no está disponible.
    }

    if (enabled) {
      ensureContext();
    }

    if (ctx && master) {
      master.gain.setTargetAtTime(enabled ? VOLUME : 0.0001, ctx.currentTime, 0.05);
    }
  }

  return {
    play,
    setEnabled,
    isEnabled: () => enabled,
  };
})();

function updateSoundButton() {
  const on = Sound.isEnabled();
  soundButton.setAttribute("aria-pressed", String(on));
  soundButton.setAttribute("aria-label", on ? "Silenciar música" : "Activar música");
  soundButton.title = on ? "Silenciar música" : "Activar música";
}

soundButton.addEventListener("click", () => {
  Sound.setEnabled(!Sound.isEnabled());
  updateSoundButton();
});

updateSoundButton();

// ---------------------------------------------------------
// Confeti (canvas a pantalla completa)
// ---------------------------------------------------------

const Confetti = (() => {
  const canvas = document.getElementById("confetti");
  const cx = canvas.getContext("2d");
  const COLORS = ["#ffd166", "#ff5e9c", "#7c5cff", "#4cc9f0", "#ff8c42", "#06d6a0", "#ffffff", "#ff9ac4"];
  const particles = [];
  let running = false;
  let lastTime = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener("resize", resize);

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function startLoop() {
    if (running) return;
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 16.667, 2.5);
    lastTime = now;

    cx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life += dt;
      p.vy += p.gravity * dt;
      p.vx *= Math.pow(p.drag, dt);
      p.vy *= Math.pow(p.drag, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;

      if (p.life > p.ttl || p.y > window.innerHeight + 80) {
        particles.splice(i, 1);
        continue;
      }

      const fade = Math.min(1, Math.max(0, (p.ttl - p.life) / 45));
      cx.save();
      cx.globalAlpha = fade * p.alpha;
      cx.translate(p.x, p.y);
      cx.rotate(p.rot);
      cx.fillStyle = p.color;

      if (p.shape === "circle") {
        cx.beginPath();
        cx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        cx.fill();
      } else {
        // El alto oscila para simular el giro de un papelito.
        const h = p.h * (0.35 + 0.65 * Math.abs(Math.cos(p.life * 0.11 + p.phase)));
        cx.fillRect(-p.w / 2, -h / 2, p.w, h);
      }

      cx.restore();
    }

    if (particles.length > 0) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      cx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  function burst(x, y, count) {
    const amount = reduceMotion ? Math.min(count, 22) : count;

    for (let i = 0; i < amount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 11;

      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5,
        gravity: 0.16 + Math.random() * 0.1,
        drag: 0.985,
        w: 5 + Math.random() * 7,
        h: 4 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.35,
        color: randomColor(),
        shape: Math.random() < 0.2 ? "circle" : "rect",
        alpha: 0.85 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        life: 0,
        ttl: 110 + Math.random() * 105,
      });
    }

    startLoop();
  }

  function rainPiece() {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: -30 - Math.random() * 80,
      vx: (Math.random() - 0.5) * 2.2,
      vy: 1.6 + Math.random() * 2.6,
      gravity: 0.012,
      drag: 0.999,
      w: 5 + Math.random() * 7,
      h: 4 + Math.random() * 8,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      color: randomColor(),
      shape: Math.random() < 0.2 ? "circle" : "rect",
      alpha: 0.75 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      life: 0,
      ttl: 280 + Math.random() * 160,
    });
  }

  function rain(durationMs) {
    if (reduceMotion) return;

    const started = performance.now();

    function step() {
      if (performance.now() - started >= durationMs) return;
      for (let i = 0; i < 6; i++) rainPiece();
      startLoop();
      window.setTimeout(step, 160);
    }

    step();
  }

  return { burst, rain };
})();

// ---------------------------------------------------------
// Globos
// ---------------------------------------------------------

const HUES = [338, 262, 45, 190, 12, 150, 310];

function launchBalloons(count) {
  if (reduceMotion) return;

  for (let i = 0; i < count; i++) {
    const balloon = document.createElement("div");
    balloon.className = "balloon";

    const size = Math.round(38 + Math.random() * 42);
    const hue = HUES[Math.floor(Math.random() * HUES.length)];
    const sway = (Math.random() < 0.5 ? -1 : 1) * Math.round(18 + Math.random() * 38);

    balloon.style.setProperty("--x", `${(2 + Math.random() * 90).toFixed(2)}vw`);
    balloon.style.setProperty("--size", `${size}px`);
    balloon.style.setProperty("--hue", String(hue));
    balloon.style.setProperty("--sway", `${sway}px`);
    balloon.style.setProperty("--delay", `${(Math.random() * 1.8).toFixed(2)}s`);
    balloon.style.setProperty("--duration", `${(8 + Math.random() * 5).toFixed(2)}s`);
    balloon.innerHTML = '<span class="balloon__body"></span><span class="balloon__string"></span>';

    balloonLayer.appendChild(balloon);
    balloon.addEventListener("animationend", () => balloon.remove(), { once: true });
  }
}

// ---------------------------------------------------------
// Abrir el regalo y mostrar el mensaje
// ---------------------------------------------------------

let opened = false;

function celebrate(originX, originY) {
  Confetti.burst(originX, originY, 160);
  Confetti.rain(2600);
  launchBalloons(22);

  if (reduceMotion) return;

  window.setTimeout(() => Confetti.burst(window.innerWidth * 0.05, window.innerHeight * 0.72, 60), 220);
  window.setTimeout(() => Confetti.burst(window.innerWidth * 0.95, window.innerHeight * 0.72, 60), 360);
}

function showMessage() {
  intro.hidden = true;
  message.hidden = false;

  requestAnimationFrame(() => {
    message.classList.add("is-visible");
    const rect = message.getBoundingClientRect();

    if (!reduceMotion) {
      window.setTimeout(() => {
        Confetti.burst(rect.left + rect.width / 2, rect.top + 30, 55);
      }, 480);
    }
  });

  window.setTimeout(() => {
    cardTitle.focus({ preventScroll: true });
  }, 700);
}

function openGift() {
  if (opened) return;
  opened = true;

  gift.classList.add("is-opening");
  gift.disabled = true;
  Sound.play();

  const rect = gift.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height * 0.45;

  celebrate(centerX, centerY);

  window.setTimeout(() => intro.classList.add("is-leaving"), 620);
  window.setTimeout(showMessage, 1040);
}

gift.addEventListener("click", openGift);

let popTimer = 0;

again.addEventListener("click", () => {
  const rect = message.getBoundingClientRect();

  Sound.play();
  window.clearTimeout(popTimer);
  message.classList.remove("is-popping");
  void message.offsetWidth;
  message.classList.add("is-popping");
  popTimer = window.setTimeout(() => message.classList.remove("is-popping"), 650);

  Confetti.burst(rect.left + rect.width / 2, rect.top + 20, 90);
  Confetti.rain(1600);
  launchBalloons(14);

  if (!reduceMotion) {
    window.setTimeout(() => Confetti.burst(rect.left + 30, rect.bottom - 30, 50), 200);
    window.setTimeout(() => Confetti.burst(rect.left + rect.width - 30, rect.bottom - 30, 50), 320);
  }
});
