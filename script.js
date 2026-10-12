/* =========================================
   🤡 CLOWN LOGIN — script.js
   ========================================= */

// ─── Confetti Generator ────────────────────
(function generateConfetti() {
  const wrapper = document.getElementById('confettiWrapper');
  const colors = ['#FF2D55','#FF9500','#FFD60A','#34C759','#007AFF','#AF52DE','#FF375F','#5AC8FA'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${6 + Math.random() * 10}px;
      height: ${8 + Math.random() * 14}px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${4 + Math.random() * 8}s;
      animation-delay: ${Math.random() * 6}s;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    wrapper.appendChild(piece);
  }
})();

// ─── Nariz interactiva ────────────────────
const nose = document.getElementById('clownNose');
let honkCount = 0;
const honkSounds = ['🎺','🎵','🎶','🎼','🎷'];

nose.addEventListener('click', () => {
  honkCount++;
  nose.style.transform = 'translateX(-50%) scale(1.5)';
  setTimeout(() => { nose.style.transform = ''; }, 200);

  // Mostrar nota musical flotante
  const note = document.createElement('span');
  note.textContent = honkSounds[Math.floor(Math.random() * honkSounds.length)];
  note.style.cssText = `
    position: fixed;
    font-size: 1.4rem;
    pointer-events: none;
    z-index: 9999;
    animation: floatNote 1s ease-out forwards;
    left: ${Math.random() * 60 + 20}%;
    top: 40%;
  `;
  document.body.appendChild(note);
  setTimeout(() => note.remove(), 1000);

  if (honkCount === 5) {
    showToast('🤡 ¡Eres todo un payaso! 🎪', 'info');
    honkCount = 0;
  }
});

// CSS extra para animación de nota
const style = document.createElement('style');
style.textContent = `
  @keyframes floatNote {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
  }
`;
document.head.appendChild(style);

// ─── Toggle contraseña ─────────────────────
const togglePass = document.getElementById('togglePass');
const passwordInput = document.getElementById('password');

togglePass.addEventListener('click', () => {
  const isHidden = passwordInput.type === 'password';
  passwordInput.type = isHidden ? 'text' : 'password';
  togglePass.textContent = isHidden ? '🙈' : '👁️';
  togglePass.style.transform = 'scale(1.3)';
  setTimeout(() => { togglePass.style.transform = ''; }, 300);
});

// ─── Formulario — Submit ───────────────────
const loginForm = document.getElementById('loginForm');
const btnEnter  = document.getElementById('btnEnter');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // Validaciones
  if (!username) {
    shakeField('fieldUser');
    showToast('🤡 ¡Ponle tu nombre de payaso!', 'error');
    return;
  }

  if (password.length < 4) {
    shakeField('fieldPass');
    showToast('🔑 La contraseña es muy corta (mín. 4 caracteres)', 'error');
    return;
  }

  // Simular carga
  btnEnter.classList.add('loading');
  btnEnter.disabled = true;

  await sleep(2000);

  btnEnter.classList.remove('loading');
  btnEnter.disabled = false;

  // Simular login exitoso
  showToast('🎪 ¡Bienvenido a la función, ' + username + '! 🤹', 'success');
  launchCelebration();
});

// ─── Shake field helper ─────────────────────
function shakeField(id) {
  const el = document.getElementById(id);
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ─── Toast helper ──────────────────────────
let toastTimer = null;
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// ─── Celebración de login exitoso ──────────
function launchCelebration() {
  const wrapper = document.getElementById('confettiWrapper');
  const colors  = ['#FF2D55','#FF9500','#FFD60A','#34C759','#007AFF','#AF52DE'];

  for (let i = 0; i < 80; i++) {
    const burst = document.createElement('span');
    burst.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 60 + 20}%;
      font-size: ${1 + Math.random() * 1.5}rem;
      pointer-events: none;
      z-index: 9999;
      animation: burstOut ${0.6 + Math.random() * 1}s ease-out forwards;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    burst.textContent = ['🎉','🎊','🤡','🎪','🎈','🎀','⭐','🌈'][Math.floor(Math.random() * 8)];
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 2000);
  }

  // Animar tarjeta
  const card = document.getElementById('loginCard');
  card.style.transition = 'transform 0.3s';
  card.style.transform = 'scale(1.04) rotate(1deg)';
  setTimeout(() => {
    card.style.transform = 'scale(1) rotate(0deg)';
  }, 400);
}

// Añadir keyframe de celebración
const celebStyle = document.createElement('style');
celebStyle.textContent = `
  @keyframes burstOut {
    0%   { opacity: 1; transform: scale(0.5) translateY(0); }
    100% { opacity: 0; transform: scale(2) translateY(-80px); }
  }
`;
document.head.appendChild(celebStyle);

// ─── Enlace "Olvidé contraseña" ───────────
document.getElementById('forgotLink').addEventListener('click', (e) => {
  e.preventDefault();
  showToast('😅 ¡Ay, qué payaso! Contacta al director del circo 🎪', 'info');
});

// ─── Enlace de registro ────────────────────
document.getElementById('linkRegister').addEventListener('click', (e) => {
  e.preventDefault();
  showToast('🤹 ¡Únete al circo pronto! Función próximamente...', 'info');
});

// ─── Ojos que siguen el cursor ─────────────
document.addEventListener('mousemove', (e) => {
  document.querySelectorAll('.pupil').forEach((pupil) => {
    const eye = pupil.parentElement;
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const dist = 4;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    pupil.style.transform = `translate(${x}px, ${y}px)`;
  });
});

// ─── Utilidad sleep ─────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
