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

function exportarPDF() {
  const dataFiltro = document.getElementById("dataFiltro").value;
  const dataTexto = dataFiltro ? converterDataInput(dataFiltro) : formatarData(new Date());
  const registros = bancoHistorico.filter(item => item.data === dataTexto);
  if (registros.length === 0) { alert("Nenhum dado para exportar."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Histórico de Placas", 105, 15, null, null, "center");
  let y = 25;
  doc.setFontSize(12);
  registros.forEach(item => {
    doc.text(`Placa: ${item.placa} | Nome: ${item.nome} | Tipo: ${item.tipo} | RG/CPF: ${item.rgcpf} | Status: ${item.status} | Entrada: ${item.horarioEntrada || '-'} | Saída: ${item.horarioSaida || '-'}`, 10, y);
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  const nomeArquivo = `historico-${dataTexto.replace(/\//g, '-')}.pdf`;
  doc.save(nomeArquivo);
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
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text("Histórico de Placas", 105, 15, null, null, "center");
  let y = 25;
  doc.setFontSize(12);
  historicoFiltrado.forEach(item => {
    doc.text(`Placa: ${item.placa} | Nome: ${item.nome} | Tipo: ${item.tipo} | RG/CPF: ${item.rgcpf} | Data: ${item.data} | Status: ${item.status}`, 10, y);
    y += 8;
    if (y > 280) { doc.addPage(); y = 20; }
  });
  const dataHoje = new Date().toISOString().split("T")[0];
  doc.save(`historico-${dataHoje}.pdf`);
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
window.checarExportacaoAutomaticaPDF = checarExportacaoAutomaticaPDF;
