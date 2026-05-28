console.log('[notificacoes.js] arquivo carregado');

// ── Notificações de e-mail via Google Apps Script ────────────────
// O GAS funciona como relay: recebe { to_email, subject, html_body }
// e envia diretamente, sem lógica de roteamento.

const EMAIL_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzmmhqFLaTSNb0BPIVIJHMpKE8JufOb0aMEnq0NQlsqI_AxRUTG7fl_Erbp7Mz4sNmSgg/exec';

// ── Layout base ──────────────────────────────────────────────────
function _emailBase(conteudo) {
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;">
  <div style="background:#d90000;padding:24px 32px;text-align:center;">
    <h1 style="color:#fff;margin:0;font-size:22px;letter-spacing:2px;">&#128293; CARVÃO LINO</h1>
  </div>
  <div style="background:#f9f9f9;padding:32px;">${conteudo}</div>
  <div style="background:#eeeeee;padding:14px 32px;text-align:center;">
    <p style="color:#aaa;font-size:11px;margin:0;">Carvão Lino &middot; Sistema de Gestão</p>
  </div>
</div>`;
}

// ── Template: novo pedido ────────────────────────────────────────
function buildEmailPedidoNovo(dados, adminNome) {
  const corpo = `
    <p style="margin:0 0 6px;">Olá, <strong>${adminNome}</strong>!</p>
    <p style="margin:0 0 24px;color:#555;">Um novo pedido foi registrado no sistema.</p>
    <div style="background:#fff;border-left:4px solid #d90000;border-radius:0 8px 8px 0;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;"><strong>Pedido:</strong> #${dados.numero}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Cliente:</strong> ${dados.cliente}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Usuário:</strong> ${dados.usuario}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Itens:</strong> ${dados.itens}</p>
      <p style="margin:0;font-size:14px;font-weight:bold;color:#d90000;">Total: ${dados.total}</p>
    </div>
    <p style="color:#999;font-size:12px;margin:0;">Acesse o painel administrativo para processar o pedido.</p>`;
  return {
    subject:   `Novo Pedido #${dados.numero} - ${dados.cliente}`,
    html_body: _emailBase(corpo)
  };
}

// ── Template: alteração de status ────────────────────────────────
function buildEmailPedidoStatus(dados, adminNome) {
  const corpo = `
    <p style="margin:0 0 6px;">Olá, <strong>${adminNome}</strong>!</p>
    <p style="margin:0 0 24px;color:#555;">O status de um pedido foi alterado.</p>
    <div style="background:#fff;border-left:4px solid #ff6a00;border-radius:0 8px 8px 0;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:13px;"><strong>Pedido:</strong> #${dados.numero}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Cliente:</strong> ${dados.cliente}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Usuário:</strong> ${dados.usuario}</p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Status anterior:</strong> <span style="color:#888;">${dados.status_anterior}</span></p>
      <p style="margin:0 0 8px;font-size:13px;"><strong>Novo status:</strong> <span style="color:#d90000;font-weight:bold;">${dados.status_novo}</span></p>
      <p style="margin:0;font-size:14px;font-weight:bold;color:#d90000;">Total: ${dados.total}</p>
    </div>`;
  return {
    subject:   `Pedido #${dados.numero} - ${dados.status_novo}`,
    html_body: _emailBase(corpo)
  };
}

// ── Disparador principal ─────────────────────────────────────────
// sb    → instância do Supabase client da página
// dados → { tipo, numero, cliente, usuario, total, ... }
async function notificarAdmins(sb, dados) {
  try {
    console.log('[notificarAdmins] chamado com tipo:', dados.tipo);

    const { data: admins } = await sb.from('profiles')
      .select('nome, email')
      .eq('tipo', 'admin')
      .eq('ativo', true);

    console.log('[notificarAdmins] admins encontrados:', admins?.length ?? 0);
    if (!admins?.length) return;

    admins.forEach(admin => {
      let email;
      if (dados.tipo === 'pedido_novo') {
        email = buildEmailPedidoNovo(dados, admin.nome);
      } else if (dados.tipo === 'pedido_status') {
        email = buildEmailPedidoStatus(dados, admin.nome);
      } else {
        console.warn('[notificarAdmins] tipo desconhecido:', dados.tipo);
        return;
      }

      const payload = {
        to_email:  admin.email,
        subject:   email.subject,
        html_body: email.html_body
      };
      console.log('[notificarAdmins] enviando para:', admin.email, '| subject:', email.subject);

      fetch(EMAIL_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
    });
  } catch (e) {
    console.warn('[notificarAdmins] erro:', e);
  }
}
