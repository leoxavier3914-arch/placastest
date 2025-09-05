// ===== Envio de e-mails =====
function enviarPDFManual() {
  const dataFiltro = document.getElementById("dataFiltro").value;
  const dataTexto = dataFiltro ? converterDataInput(dataFiltro) : formatarData(new Date());
  const registros = bancoHistorico.filter(item => item.data === dataTexto);
  if (registros.length === 0) {
    alert("Nenhum histórico encontrado para a data selecionada!");
    return;
  }
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
  const pdfData = doc.output("datauristring");
  const nomeArquivo = `historico-${dataTexto.replace(/\//g, '-')}.pdf`;
  emailjs.send(
    "service_t9bocqh",
    "template_n4uw7xi",
    {
      to_email: "leomatos3914@gmail.com",
      title: `Histórico Diário - ${dataTexto}`,
      name: "Sistema de Placas",
      message: `Histórico de Placas - ${dataTexto}`
    },
    {
      attachments: [
        { name: nomeArquivo, data: pdfData }
      ]
    }
  ).then(() => {
    alert("📧 Histórico enviado manualmente com sucesso!");
  }).catch(err => {
    alert("❌ Erro ao enviar: " + JSON.stringify(err));
  });
}

const horaEnvio = 18;
const minutoEnvio = 30;

function jaEnviouHoje() {
  const ultimoEnvio = localStorage.getItem("ultimoEnvio");
  const hoje = formatarData(new Date());
  return ultimoEnvio === hoje;
}

function marcarEnvio() {
  const hoje = formatarData(new Date());
  localStorage.setItem("ultimoEnvio", hoje);
}

function enviarHistoricoDiario() {
  const hoje = formatarData(new Date());
  const filtered = bancoHistorico.filter(item => item.data === hoje);
  if (filtered.length === 0) return;
  let mensagem = "📌 Histórico de Placas - " + hoje + "\n\n";
  filtered.forEach(item => {
    mensagem += `🚗 Placa: ${item.placa} | 👤 Nome: ${item.nome} | 🏷 Tipo: ${item.tipo} | 🆔 RG/CPF: ${item.rgcpf} | 📍 Status:${item.status} | ⏰ Entrada: ${item.horarioEntrada || "-"} | ⏱ Saída: ${item.horarioSaida || "-"}\n`;
  });
  emailjs.send("service_t9bocqh", "template_n4uw7xi", {
    to_email: "leomatos3914@gmail.com",
    message: mensagem,
    title: "Histórico Diário",
    name: "Sistema de Placas"
  }).then(() => {
    console.log("✅ Histórico do dia enviado por e-mail.");
    marcarEnvio();
  }).catch(err => {
    alert("❌ Erro no envio: " + JSON.stringify(err));
  });
}

window.addEventListener("load", () => {
  const agora = new Date();
  if (!jaEnviouHoje() && (agora.getHours() > horaEnvio || (agora.getHours() === horaEnvio && agora.getMinutes() >= minutoEnvio))) {
    enviarHistoricoDiario();
  }
});

setInterval(() => {
  const agora = new Date();
  if (!jaEnviouHoje() && agora.getHours() === horaEnvio && agora.getMinutes() === minutoEnvio) {
    enviarHistoricoDiario();
  }
}, 60000);

// Expondo globalmente
window.enviarPDFManual = enviarPDFManual;

