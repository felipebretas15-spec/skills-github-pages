/**
 * Controle de Inatividade – Carvão Lino
 * Uso: chame initInatividade(sbClient) logo após confirmar sessão ativa.
 * Padrão: 3 minutos de inatividade → aviso 30s antes → desloga.
 */
function initInatividade(sb, minutos) {
  minutos = minutos || 3;

  var TIMEOUT_MS = minutos * 60 * 1000;
  var AVISO_MS   = 30 * 1000;

  var timerLogout, timerAviso, intervalo;
  var toast;

  /* ── Cria toast de aviso ── */
  function criarToast() {
    toast = document.createElement('div');
    toast.id = 'inatividade-toast';
    toast.setAttribute('style', [
      'position:fixed',
      'bottom:28px',
      'left:50%',
      'transform:translateX(-50%) translateY(120px)',
      'background:#1a0000',
      'border:1px solid #ff2200',
      'color:#fff',
      'font-family:Montserrat,sans-serif',
      'font-size:.82rem',
      'font-weight:600',
      'padding:14px 22px',
      'border-radius:10px',
      'box-shadow:0 8px 32px rgba(217,0,0,.45)',
      'z-index:99999',
      'display:none',
      'align-items:center',
      'gap:16px',
      'white-space:nowrap',
      'transition:transform .35s ease,opacity .35s ease',
      'opacity:0'
    ].join(';'));

    toast.innerHTML =
      '<span>⏳ Sessão encerra em <strong id="_ina_cnt">30</strong>s por inatividade.</span>' +
      '<button id="_ina_btn" style="background:#d90000;border:none;color:#fff;' +
      'font-family:inherit;font-size:.78rem;font-weight:700;padding:5px 14px;' +
      'border-radius:5px;cursor:pointer;flex-shrink:0;">Continuar</button>';

    document.body.appendChild(toast);
    document.getElementById('_ina_btn').addEventListener('click', resetar);
  }

  function mostrarToast() {
    if (!toast) criarToast();
    toast.style.display = 'flex';
    void toast.offsetWidth; // reflow para disparar transição
    toast.style.transform = 'translateX(-50%) translateY(0)';
    toast.style.opacity   = '1';

    var seg = 30;
    var cnt = document.getElementById('_ina_cnt');
    if (cnt) cnt.textContent = seg;
    clearInterval(intervalo);
    intervalo = setInterval(function () {
      seg--;
      if (cnt) cnt.textContent = Math.max(seg, 0);
      if (seg <= 0) clearInterval(intervalo);
    }, 1000);
  }

  function esconderToast() {
    if (!toast) return;
    toast.style.transform = 'translateX(-50%) translateY(120px)';
    toast.style.opacity   = '0';
    clearInterval(intervalo);
    setTimeout(function () { if (toast) toast.style.display = 'none'; }, 380);
  }

  async function deslogar() {
    esconderToast();
    await sb.auth.signOut();
    window.location.href = 'login.html';
  }

  function resetar() {
    clearTimeout(timerLogout);
    clearTimeout(timerAviso);
    esconderToast();
    timerAviso  = setTimeout(mostrarToast, TIMEOUT_MS - AVISO_MS);
    timerLogout = setTimeout(deslogar,     TIMEOUT_MS);
  }

  // Expõe para uso externo se necessário
  window._resetInatividade = resetar;

  // Registra eventos de interação
  ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(function (ev) {
    document.addEventListener(ev, resetar, { passive: true });
  });

  // Inicia o temporizador
  resetar();
}
