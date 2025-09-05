// ===== Banco de dados local =====
let bancoCadastros = JSON.parse(localStorage.getItem("bancoCadastros")) || [];
let bancoHistorico = JSON.parse(localStorage.getItem("bancoHistorico")) || [];
let bancoAutorizados = JSON.parse(localStorage.getItem("bancoAutorizados")) || [];

function salvarBanco() {
  localStorage.setItem("bancoCadastros", JSON.stringify(bancoCadastros));
  localStorage.setItem("bancoHistorico", JSON.stringify(bancoHistorico));
  localStorage.setItem("bancoAutorizados", JSON.stringify(bancoAutorizados));
}

// Expondo variáveis e função globalmente para uso entre arquivos
window.bancoCadastros = bancoCadastros;
window.bancoHistorico = bancoHistorico;
window.bancoAutorizados = bancoAutorizados;
window.salvarBanco = salvarBanco;
