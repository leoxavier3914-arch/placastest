// ===== Histórico e exportação =====
function atualizarTabelaAndamento() {
  const tbody = document.getElementById("tabelaAndamento");
  if (!tbody) return;
  tbody.innerHTML = "";
  bancoHistorico.filter(h => h.status === "Em andamento").forEach(h => {
    tbody.innerHTML += `<tr><td>${h.placa}</td><td>${h.nome}</td><td class="horaEntrada">${h.horarioEntrada}</td><td><button class="saida" onclick="marcarSaida('${h.placa}')">Saída</button></td></tr>`;
  });
}

function formatarData(d) {
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getFullYear()}`;
}

function converterDataInput(input) {
  const p = input.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function filtrarHistorico() {
  const input = document.getElementById("dataFiltro").value;
  const dataFiltro = input ? converterDataInput(input) : formatarData(new Date());
  const listaDiv = document.getElementById("listaHistorico");
  listaDiv.innerHTML = "";
  bancoHistorico.filter(i => i.data === dataFiltro).forEach(item => {
    let cor = item.status === "Em andamento" ? "red" : item.status === "Finalizado" ? "green" : "black";
    listaDiv.innerHTML += `<div class="item"><b>${item.placa}</b> - ${item.nome} [${item.tipo}] - RG/CPF: ${item.rgcpf}<br>Data:${item.data}<br>Status:<span style="color:${cor}">${item.status}</span><br>Entrada:<span class="horaEntrada">${item.horarioEntrada || "-"}</span>|Saída:<span class="horaSaida">${item.horarioSaida || "-"}</span></div>`;
  });
}

function exportarCSV() {
  const dataFiltro = document.getElementById("dataFiltro").value;
  const dataTexto = dataFiltro ? converterDataInput(dataFiltro) : formatarData(new Date());
  const filtered = bancoHistorico.filter(item => item.data === dataTexto);
  if (filtered.length === 0) { alert("Nenhum dado para exportar."); return; }
  let csv = "Placa,Nome,Tipo,RG/CPF,Data,Status,Entrada,Saída\n";
  filtered.forEach(item => {
    csv += `${item.placa},${item.nome},${item.tipo},${item.rgcpf},${item.data},${item.status},${item.horarioEntrada || '-'},${item.horarioSaida || '-'}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const nomeArquivo = `historico-${dataTexto.replace(/\//g, '-')}.csv`;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
  alert("Exportado com sucesso!");
}

// Configurações do EmailJS
const EMAILJS_SERVICE_ID = "service_t9bocqh";
const EMAILJS_TEMPLATE_ID = "template_n4uw7xi";
const EMAILJS_PUBLIC_KEY = "vPVpXFO3k8QblVbqr";

if (window.emailjs) {
  emailjs.init(EMAILJS_PUBLIC_KEY);
}

let relatoriosEnviados = [];
if (typeof localStorage !== "undefined") {
  relatoriosEnviados = JSON.parse(localStorage.getItem("relatoriosEnviados") || "[]");
}

function gerarRelatorioPDF(registros, dataRelatorio) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("Biblioteca jsPDF não carregada!");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const linhas = registros.map(item => [
    item.placa,
    item.nome,
    item.tipo,
    item.rgcpf,
    item.status,
    item.horarioEntrada || '-',
    item.horarioSaida || '-'
  ]);

  doc.autoTable({
    head: [["Placa", "Nome", "Tipo", "RG/CPF", "Status", "Entrada", "Saída"]],
    body: linhas,
    startY: 30,
    margin: { top: 30, left: 10, right: 10 },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 35 },
      2: { cellWidth: 20 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 }
    },
    didDrawPage: (data) => {
      doc.setFontSize(16);
      doc.text("Empresa XYZ", pageWidth / 2, 15, { align: "center" });
      doc.setFontSize(12);
      doc.text(`Data do relatório: ${dataRelatorio}`, pageWidth / 2, 22, { align: "center" });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFontSize(10);
      doc.text(`Página ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    }
  });
  return doc;
}

function exportarPDF() {
  const dataFiltro = document.getElementById("dataFiltro").value;
  const dataTexto = dataFiltro ? converterDataInput(dataFiltro) : formatarData(new Date());
  const registros = bancoHistorico.filter(item => item.data === dataTexto);
  if (registros.length === 0) { alert("Nenhum dado para exportar."); return; }

  const nomeArquivo = `historico-${dataTexto.replace(/\//g, '-')}.pdf`;
  const doc = gerarRelatorioPDF(registros, dataTexto);
  if (doc) {
    doc.save(nomeArquivo);
    alert("Exportado com sucesso!");
  }
}


function enviarEmail() {
  const dataFiltro = document.getElementById("dataFiltro").value;
  const dataTexto = dataFiltro ? converterDataInput(dataFiltro) : formatarData(new Date());
  const registros = bancoHistorico.filter(item => item.data === dataTexto);
  if (registros.length === 0) { alert("Nenhum dado para enviar."); return; }


  const doc = gerarRelatorioPDF(registros, dataTexto);
  if (!doc) return;
  const pdfDataUri = doc.output("datauristring");

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: "leomato3914@gmail.com",
    message: "TESTE",
    attachment: pdfDataUri

  }).then(() => {
    alert("PDF enviado com sucesso!");
    const dataISO = dataTexto.split("/").reverse().join("-");
    localStorage.setItem("ultimoRelatorioEnviado", dataISO);
    if (!relatoriosEnviados.includes(dataISO)) {
      relatoriosEnviados.push(dataISO);
      localStorage.setItem("relatoriosEnviados", JSON.stringify(relatoriosEnviados));
    }
  }).catch(err => {
    console.error("Erro ao enviar PDF:", err);
    alert("Falha ao enviar o PDF.");
  });
}

// Envia e-mail automaticamente utilizando um PDF já gerado
function enviarEmailAutomatico(pdfDataUri, data) {
  return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: "leomato3914@gmail.com",
    message: `Envio automático ${data}`,
    attachment: pdfDataUri
  }).then(() => {
    console.log(`Relatório de ${data} enviado automaticamente.`);
    localStorage.setItem("ultimoRelatorioEnviado", data);
  }).catch(err => {
    console.error(`Erro ao enviar relatório automático de ${data}:`, err);
    throw err;
  });
}

// Processa e envia relatórios pendentes desde a última data enviada
async function processarRelatoriosPendentes() {
  const ontem = new Date();
  ontem.setDate(ontem.getDate() - 1);

  const ultimoStr = localStorage.getItem("ultimoRelatorioEnviado");
  let proxima;

  if (ultimoStr) {
    const ultimo = new Date(ultimoStr);
    proxima = new Date(ultimo);
    proxima.setDate(proxima.getDate() + 1);
  } else {
    // Busca a primeira data existente no histórico
    proxima = bancoHistorico.reduce((min, item) => {
      const [d, m, a] = item.data.split("/").map(Number);
      const dt = new Date(a, m - 1, d);
      return (!min || dt < min) ? dt : min;
    }, null);
  }

  if (!proxima) {
    agendarEnvioHoje();
    return;
  }

  while (proxima <= ontem) {
    const dataISO = proxima.toISOString().split("T")[0];
    const dataTexto = formatarData(proxima);
    const registros = bancoHistorico.filter(i => i.data === dataTexto);
    try {
      if (registros.length > 0) {
        const doc = gerarRelatorioPDF(registros, dataTexto);
        if (doc) {
          const pdfDataUri = doc.output("datauristring");
          await enviarEmailAutomatico(pdfDataUri, dataISO);
        }
      } else {
        localStorage.setItem("ultimoRelatorioEnviado", dataISO);
      }
    } catch (err) {
      break;
    }
    proxima.setDate(proxima.getDate() + 1);
  }

  agendarEnvioHoje();
}

function agendarEnvioHoje() {
  const agora = new Date();
  const fimDia = new Date();
  fimDia.setHours(23, 59, 0, 0);
  const ms = fimDia.getTime() - agora.getTime();
  if (ms <= 0) return;
  setTimeout(async () => {
    const hojeISO = new Date().toISOString().split("T")[0];
    if (relatoriosEnviados.includes(hojeISO)) {
      return;
    }
    const hojeTexto = formatarData(new Date());
    const registros = bancoHistorico.filter(i => i.data === hojeTexto);
    if (registros.length > 0) {
      const doc = gerarRelatorioPDF(registros, hojeTexto);
      if (doc) {
        const pdfDataUri = doc.output("datauristring");
        try { await enviarEmailAutomatico(pdfDataUri, hojeISO); } catch (err) {}
      }
    } else {
      localStorage.setItem("ultimoRelatorioEnviado", hojeISO);
    }
  }, ms);
}

function checarExportacaoAutomaticaPDF() {
  const agora = new Date();
  const ultimaExportacao = localStorage.getItem("ultimaExportacao");
  let dataInicio;
  if (ultimaExportacao) {
    const ultima = new Date(ultimaExportacao);
    const diff = agora - ultima;
    const horas24 = 24 * 60 * 60 * 1000;
    if (diff >= horas24) { dataInicio = ultima; } else { return; }
  } else { dataInicio = new Date(agora.getTime() - 24 * 60 * 60 * 1000); }
  const historicoFiltrado = bancoHistorico.filter(item => {
    const [dia, mes, ano] = item.data.split("/").map(Number);
    const dataItem = new Date(ano, mes - 1, dia);
    return dataItem > dataInicio;
  });
  if (historicoFiltrado.length === 0) return;
  const dataHoje = new Date().toISOString().split("T")[0];
  const doc = gerarRelatorioPDF(historicoFiltrado, formatarData(new Date()));
  if (doc) {
    doc.save(`historico-${dataHoje}.pdf`);
  }
  localStorage.setItem("ultimaExportacao", agora.toISOString());
  console.log("Exportação automática em PDF realizada!");
}

// ===== Exportação/Importação LocalStorage =====
function exportLocalStorage() {
  return JSON.stringify({
    bancoCadastros,
    bancoHistorico,
    bancoAutorizados
  });
}

function downloadLS(filename = "backup_localstorage.json") {
  const blob = new Blob([exportLocalStorage()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function criarBotaoExportLS() {
  const btn = document.createElement("button");
  btn.textContent = "Exportar LS";
  btn.style = "padding:5px 10px; margin:5px; cursor:pointer; background:#2196F3; color:white; border:none; border-radius:5px;";
  btn.addEventListener("click", () => {
    downloadLS();
    localStorage.setItem("lastLSBackup", Date.now().toString());
    alert("Backup exportado!");
  });
  document.getElementById("historicoContainer").insertBefore(btn, null);
}
criarBotaoExportLS();

const importInput = document.createElement("input");
importInput.type = "file";
importInput.accept = ".json";
importInput.style.display = "none";
document.body.appendChild(importInput);

const importBtn = document.createElement("button");
importBtn.textContent = "Importar LS";
importBtn.style = "padding:5px 10px; margin:5px; cursor:pointer;";
document.getElementById("historicoContainer").appendChild(importBtn);

importBtn.addEventListener("click", () => importInput.click());

importInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      const chaves = ["bancoCadastros","bancoHistorico","bancoAutorizados"];
      if (!chaves.every(k => dados.hasOwnProperty(k))) {
        alert("Arquivo inválido!");
        return;
      }
      chaves.forEach(k => localStorage.setItem(k, JSON.stringify(dados[k])));
      bancoCadastros = dados.bancoCadastros;
      bancoHistorico = dados.bancoHistorico;
      bancoAutorizados = dados.bancoAutorizados;
      salvarBanco();
      atualizarCadastros();
      atualizarTabelaAndamento();
      atualizarAutorizados();
      alert("Backup importado com sucesso!");
      importInput.value = "";
    } catch (err) {
      console.error(err);
      alert("Erro ao importar arquivo!");
    }
  };
  reader.readAsText(file);
});

// Expondo globalmente
window.atualizarTabelaAndamento = atualizarTabelaAndamento;
window.formatarData = formatarData;
window.converterDataInput = converterDataInput;
window.filtrarHistorico = filtrarHistorico;
window.exportarCSV = exportarCSV;
window.exportarPDF = exportarPDF;


window.enviarEmail = enviarEmail;
window.enviarEmailAutomatico = enviarEmailAutomatico;
window.processarRelatoriosPendentes = processarRelatoriosPendentes;

window.checarExportacaoAutomaticaPDF = checarExportacaoAutomaticaPDF;

// Salva o histórico no repositório GitHub usando a API de Contents
// token  - token pessoal do GitHub com permissão de commit
// owner  - nome do usuário/organização
// repo   - nome do repositório
async function salvarHistoricoGitHub(token, owner, repo) {
  if (!token || !owner || !repo) {
    alert("Parâmetros inválidos para salvar no GitHub");
    return;
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/contents/data/historico.json`;
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  // Converte o histórico para Base64
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(bancoHistorico, null, 2))));

  let sha;
  // Busca o SHA do arquivo existente, caso já exista
  const getRes = await fetch(url, { headers });
  if (getRes.ok) {
    const data = await getRes.json();
    sha = data.sha;
  }

  const body = { message: "Atualiza histórico", content, sha };
  const putRes = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
  if (!putRes.ok) {
    const text = await putRes.text();
    console.error("Falha ao atualizar histórico:", putRes.status, text);
    alert("Erro ao salvar histórico no GitHub");
    return;
  }

  alert("Histórico salvo no GitHub!");
}

window.salvarHistoricoGitHub = salvarHistoricoGitHub;
