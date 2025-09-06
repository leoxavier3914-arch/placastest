// ===== Banco de dados local =====
let bancoCadastros = JSON.parse(localStorage.getItem("bancoCadastros")) || [];
let bancoHistorico = JSON.parse(localStorage.getItem("bancoHistorico")) || [];
let bancoAutorizados = JSON.parse(localStorage.getItem("bancoAutorizados")) || [];

// Mapa {dateISO: [registros]} do histórico
let bancoHistoricoMap = {};

// Reconstrói o mapa a partir do array
function rebuildHistoricoMap() {
  bancoHistoricoMap = {};
  bancoHistorico.forEach(r => {
    const iso = r.data.split("/").reverse().join("-");
    if (!bancoHistoricoMap[iso]) bancoHistoricoMap[iso] = [];
    bancoHistoricoMap[iso].push(r);
  });
  // expõe o mapa sempre atualizado
  window.bancoHistoricoMap = bancoHistoricoMap;
}

rebuildHistoricoMap();

// Adiciona um novo registro ao histórico e atualiza o mapa
function adicionarHistorico(registro) {
  bancoHistorico.push(registro);
  const iso = registro.data.split("/").reverse().join("-");
  if (!bancoHistoricoMap[iso]) bancoHistoricoMap[iso] = [];
  bancoHistoricoMap[iso].push(registro);
  salvarBanco();
}

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
window.adicionarHistorico = adicionarHistorico;
window.rebuildHistoricoMap = rebuildHistoricoMap;
